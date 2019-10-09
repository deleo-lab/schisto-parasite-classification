import React, { Component, Fragment } from 'react';
import {
  Alert, Button, ButtonGroup, Collapse, Container, Form, Spinner,
  ListGroup, Tabs, Tab
} from 'react-bootstrap';
import { FaCamera, FaChevronDown, FaChevronRight, FaCheck } from 'react-icons/fa';
import { openDB } from 'idb';
import Cropper from 'react-cropper';
import * as tf from '@tensorflow/tfjs';
import * as queryString from 'query-string';
import LoadButton from '../components/LoadButton';
import { PARASITE_CLASSES, SNAIL_CLASSES } from '../model/classes';
import config from '../config';
import './Classify.css';
import 'cropperjs/dist/cropper.css';


const PARASITE_MODEL_PATH = '/models/parasites/model.json';
const SNAIL_MODEL_PATH = '/models/snails/model.json';
const IMAGE_SIZE = 64;
const CANVAS_SIZE = 128;
const TOPK_PREDICTIONS = 4;

const INDEXEDDB_DB = 'tensorflowjs';
const INDEXEDDB_STORE = 'model_info_store';
const INDEXEDDB_PARASITE_KEY = 'parasite-model';
const INDEXEDDB_SNAIL_KEY = 'snail-model';

/**
 * Class to handle the rendering of the Classify page.
 * @extends React.Component
 */
export default class Classify extends Component {

  constructor(props) {
    super(props);

    this.webcam = null;
    this.model = null;
    this.modelLastUpdated = null;
    this.modelDBKey = INDEXEDDB_PARASITE_KEY;
    this.modelPath = PARASITE_MODEL_PATH;
    this.modelClasses = PARASITE_CLASSES;

    // References to the models if we load them.
    this.snailModel = null;
    this.parasiteModel = null;

    // Whether input image should be converted to grayscale before inference.
    // Currently only effects webcam image.
    this.convertToGrayscale = true;

    this.state = {
      modelLoaded: false,
      webcamLoaded: false,
      isFirstLoad: false,
      filename: '',
      isClassifying: false,
      predictions: [],
      photoSettingsOpen: true,
      modelType: 'parasites',
      inputTab: 'camera',
      modelUpdateAvailable: false,
      showModelUpdateAlert: false,
      showModelUpdateSuccess: false,
      isDownloadingModel: false,
    };

    const queryParams = queryString.parse(props.location.search);
    if ('model' in queryParams && queryParams['model']  === 'snails') {
      this.state.modelType = 'snails';
      this.modelDBKey = INDEXEDDB_SNAIL_KEY;
      this.modelPath = SNAIL_MODEL_PATH;
      this.modelClasses = SNAIL_CLASSES;
      this.convertToGrayscale = false;
    }
  }

  async componentDidMount() {
    await this.loadModel();
    this.initWebcam();
  }

  async componentWillUnmount() {
    if (this.webcam) {
      this.webcam.stop();
    }

    // Dispose of the models.
    if (this.snailModel) {
      this.snailModel.dispose();
    }
    if (this.parasiteModel) {
      this.parasiteModel.dispose();
    }
  }

  loadModel = async () => {
    this.setState({ modelLoaded: false });
    if (('indexedDB' in window)) {
      try {
        this.model = await tf.loadLayersModel('indexeddb://' + this.modelDBKey);

        // Safe to assume tensorflowjs database and related object store exists.
        // Get the date when the model was saved and compare it with the model date
        // from the server.
        try {
          const db = await openDB(INDEXEDDB_DB, 1, );
          const item = await db.transaction(INDEXEDDB_STORE)
                               .objectStore(INDEXEDDB_STORE)
                               .get(this.modelDBKey);
          const dateSaved = new Date(item.modelArtifactsInfo.dateSaved);
          await this.getModelInfo();
          if (!this.modelLastUpdated  || dateSaved >= new Date(this.modelLastUpdated).getTime()) {
            console.log('Using saved model: ' + this.modelDBKey);
          }
          else {
            // There is a newer model available
            this.setState({
              modelUpdateAvailable: true,
              showModelUpdateAlert: true,
            });
          }
        }
        catch (error) {
          console.warn(error);
          console.warn('Could not retrieve when model was saved.');
        }
      }
      // If error here, assume that the object store doesn't exist and the model currently isn't
      // saved in IndexedDB.
      catch (error) {
        console.log('Key ' +  this.modelDBKey + ' not found in IndexedDB. Loading and saving...');
        this.setState({ isFirstLoad: true });
        this.model = await tf.loadLayersModel(this.modelPath);
        await this.model.save('indexeddb://' + this.modelDBKey);
      }
    }
    // If no IndexedDB, then just download like normal.
    else {
      console.warn('IndexedDB not supported.');
      this.setState({ isFirstLoad: true });
      this.model = await tf.loadLayersModel(this.modelPath);
    }
    this.setState({ modelLoaded: true });

    // Warm up model.
    this.model.predict(tf.zeros([1, IMAGE_SIZE, IMAGE_SIZE, 3])).dispose();

    // Save references to each model in case we need to reuse them.
    if (this.state.modelType === 'snails') {
      this.snailModel = this.model;
    }
    else {
      this.parasiteModel = this.model;
    }
  }

  initWebcam = async () => {

    this.setState({ webcamLoaded: false });
    // For some reason when switching between models, the webcam
    // video is greyed out. Let's just stop and reset the existing one.
    if (this.webcam) {
      this.webcam.stop();
      delete this.webcam;
    }

    try {
      this.webcam = await tf.data.webcam(
        this.refs.webcam,
        {resizeWidth: CANVAS_SIZE, resizeHeight: CANVAS_SIZE, facingMode: 'environment'}
      );
      this.setState({ webcamLoaded: true });
    }
    catch (e) {
      this.refs.noWebcam.style.display = 'block';
    }
  }

  startWebcam = async () => {
    if (this.webcam) {
      this.webcam.start();
    }
  }

  stopWebcam = async () => {
    if (this.webcam) {
      this.webcam.stop();
    }
  }

  getModelInfo = async () => {
    await fetch(`${config.API_ENDPOINT}/model_info/${this.state.modelType}`, {
      method: 'GET',
    })
    .then(async (response) => {
      await response.json().then((data) => {
        this.modelLastUpdated = data.last_updated;
      })
      .catch((err) => {
        console.log('Unable to get parse model info.');
      });
    })
    .catch((err) => {
      console.log('Unable to get model info');
    });
  }

  classifyLocalImage = async () => {
    this.setState({ isClassifying: true });

    const croppedCanvas = this.refs.cropper.getCroppedCanvas();
    const image = tf.tidy( () => tf.browser.fromPixels(croppedCanvas).toFloat());

    // Process and resize image before passing in to model.
    const imageData = await this.processImage(image);
    const resizedImage = tf.image.resizeBilinear(imageData, [IMAGE_SIZE, IMAGE_SIZE]);

    const logits = this.model.predict(resizedImage);
    const probabilities = await logits.data();
    const preds = await this.getTopKClasses(probabilities, TOPK_PREDICTIONS);

    this.setState({
      predictions: preds,
      isClassifying: false,
      photoSettingsOpen: !this.state.photoSettingsOpen
    });

    // Draw thumbnail to UI.
    const context = this.refs.canvas.getContext('2d');
    const ratioX = CANVAS_SIZE / croppedCanvas.width;
    const ratioY = CANVAS_SIZE / croppedCanvas.height;
    const ratio = Math.min(ratioX, ratioY);
    context.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    context.drawImage(croppedCanvas, 0, 0,
                      croppedCanvas.width * ratio, croppedCanvas.height * ratio);

    // Dispose of tensors we are finished with.
    image.dispose();
    imageData.dispose();
    resizedImage.dispose();
    logits.dispose();
  }

  classifyWebcamImage = async () => {
    this.setState({ isClassifying: true });

    let imageCapture = await this.webcam.capture();

    if (this.convertToGrayscale) {
      const grayscale = tf.tidy(() => {
        return tf.tile(imageCapture.mean(2).expandDims(-1), [1, 1, 3]);
      });
      imageCapture.dispose();
      imageCapture = grayscale;
    }

    const resized = tf.image.resizeBilinear(imageCapture, [IMAGE_SIZE, IMAGE_SIZE]);
    const imageData = await this.processImage(resized);
    const logits = this.model.predict(imageData);
    const probabilities = await logits.data();
    const preds = await this.getTopKClasses(probabilities, TOPK_PREDICTIONS);
    this.setState({
      predictions: preds,
      isClassifying: false,
      photoSettingsOpen: !this.state.photoSettingsOpen
    });

    // Draw thumbnail to UI.
    const tensorData = tf.tidy(() => imageCapture.toFloat().div(255));
    await tf.browser.toPixels(tensorData, this.refs.canvas);

    // Dispose of tensors we are finished with.
    resized.dispose();
    imageCapture.dispose();
    imageData.dispose();
    logits.dispose();
    tensorData.dispose();
  }

  processImage = async (image) => {
    return tf.tidy(() => image.expandDims(0).toFloat().div(127).sub(1));
  }

  /**
   * Computes the probabilities of the topK classes given logits by computing
   * softmax to get probabilities and then sorting the probabilities.
   * @param logits Tensor representing the logits from MobileNet.
   * @param topK The number of top predictions to show.
   */
  getTopKClasses = async (values, topK) => {
    const valuesAndIndices = [];
    for (let i = 0; i < values.length; i++) {
      valuesAndIndices.push({value: values[i], index: i});
    }
    valuesAndIndices.sort((a, b) => {
      return b.value - a.value;
    });
    const topkValues = new Float32Array(topK);
    const topkIndices = new Int32Array(topK);
    for (let i = 0; i < topK; i++) {
      topkValues[i] = valuesAndIndices[i].value;
      topkIndices[i] = valuesAndIndices[i].index;
    }

    const topClassesAndProbs = [];
    for (let i = 0; i < topkIndices.length; i++) {
      topClassesAndProbs.push({
        className: this.modelClasses[topkIndices[i]],
        probability: (topkValues[i] * 100).toFixed(2)
      });
    }
    return topClassesAndProbs;
  }

  updateModel = async () => {
    // Get the latest model from the server and refresh the one saved in IndexedDB.
    console.log('Updating the model: ' + this.modelDBKey);
    this.setState({ isDownloadingModel: true });
    this.model = await tf.loadLayersModel(this.modelPath);
    await this.model.save('indexeddb://' + this.modelDBKey);
    this.setState({
      isDownloadingModel: false,
      modelUpdateAvailable: false,
      showModelUpdateAlert: false,
      showModelUpdateSuccess: true
    });
  }


  handleSnailModelChange = async event => {
    if (this.state.modelType !== 'snails') {
      this.setState({
        modelType: 'snails',
        predictions: [],
        photoSettingsOpen: true,
        filename: null,
        file: null
      });
      this.modelDBKey = INDEXEDDB_SNAIL_KEY;
      this.modelPath = SNAIL_MODEL_PATH;
      this.modelClasses = SNAIL_CLASSES;
      this.convertToGrayscale = false;

      if (!this.snailModel) {
        await this.loadModel();
      }
      else {
        this.model = this.snailModel;
      }
      this.setState({inputTab: 'camera'});
      this.initWebcam();
    }
  }

  handleParasiteModelChange = async event => {
    if (this.state.modelType !== 'parasites') {
      this.setState({
        modelType: 'parasites',
        predictions: [],
        photoSettingsOpen: true,
        filename: null,
        file: null
      });
      this.modelDBKey = INDEXEDDB_PARASITE_KEY;
      this.modelPath = PARASITE_MODEL_PATH;
      this.modelClasses = PARASITE_CLASSES;
      this.convertToGrayscale = true;

      if (!this.parasiteModel) {
        await this.loadModel();
      }
      else {
        this.model = this.parasiteModel;
      }
      this.setState({inputTab: 'camera'});
      this.initWebcam();
    }
  }

  handlePanelClick = event => {
    this.setState({ photoSettingsOpen: !this.state.photoSettingsOpen });
  }

  handleFileChange = event => {
    if (event.target.files && event.target.files.length > 0) {
      this.setState({
        file: URL.createObjectURL(event.target.files[0]),
        filename: event.target.files[0].name
      });
    }
  }

  handleTabSelect = activeKey => {

    switch(activeKey) {
      case 'camera':
        this.setState({inputTab: 'camera'});
        this.startWebcam();
        break;
      case 'localfile':
        // Reset file states.
        this.setState({filename: null, file: null, inputTab: 'localfile'});
        this.stopWebcam();
        break;
      default:
    }
  }

  render() {
    return (
      <div className="Classify container">
      <h4>What are you classifying?</h4>
      <ButtonGroup aria-label="Model Type" className="d-block model-buttons">
        <Button
          variant={this.state.modelType !== 'snails' ? 'dark' : 'outline-dark' }
          active={this.state.modelType !== 'snails'}
          onClick={this.handleParasiteModelChange}>
            { this.state.modelType !== 'snails' && <FaCheck /> } Parasites
        </Button>
        <Button
          variant={this.state.modelType === 'snails' ? 'dark' : 'outline-dark' }
          active={this.state.modelType === 'snails'}
          onClick={this.handleSnailModelChange}>
          Snails { this.state.modelType === 'snails' && <FaCheck /> }
        </Button>
      </ButtonGroup>
      { !this.state.modelLoaded &&
        <div className="pt-4">
          <Spinner animation="border" role="status">
            <span className="sr-only">Loading...</span>
          </Spinner>
          {' '}<span className="loading-model-text">Loading Model</span>
          { this.state.isFirstLoad &&
            <div>
              <p>Downloading model from the web. This first download may take a while.</p>
            </div>
          }
        </div>
      }

      { this.state.modelLoaded &&
        <div className="pt-3">
        <Button
          onClick={this.handlePanelClick}
          className="classify-panel-header"
          aria-controls="photo-selection-pane"
          aria-expanded={this.state.photoSettingsOpen}
          >
          Take or Select a Photo to Classify
            <span className='panel-arrow'>
            { this.state.photoSettingsOpen
              ? <FaChevronDown />
              : <FaChevronRight />
            }
            </span>
          </Button>
          <Collapse in={this.state.photoSettingsOpen}>
            <div id="photo-selection-pane">
              { this.state.modelUpdateAvailable && this.state.showModelUpdateAlert &&
                <Container>
                  <Alert
                    variant="info"
                    show={this.state.modelUpdateAvailable && this.state.showModelUpdateAlert}
                    onClose={() => this.setState({ showModelUpdateAlert: false})}
                    dismissible>
                      An update for the <strong>{this.state.modelType}</strong> model is available.
                      <div className="d-flex justify-content-center pt-1">
                        {!this.state.isDownloadingModel &&
                          <Button onClick={this.updateModel}
                                  variant="outline-info">
                            Update
                          </Button>
                        }
                        {this.state.isDownloadingModel &&
                          <div>
                            <Spinner animation="border" role="status" size="sm">
                              <span className="sr-only">Downloading...</span>
                            </Spinner>
                            {' '}<strong>Downloading...</strong>
                          </div>
                        }
                      </div>
                  </Alert>
                </Container>
              }

              {this.state.showModelUpdateSuccess &&
                <Container>
                  <Alert variant="success"
                         onClose={() => this.setState({ showModelUpdateSuccess: false})}
                         dismissible>
                    The <strong>{this.state.modelType}</strong> model has been updated!
                  </Alert>
                </Container>
              }

            <Tabs id="input-options" activeKey={this.state.inputTab}
                  onSelect={this.handleTabSelect}
                  className="justify-content-center">
              <Tab eventKey="camera" title="Take Photo">
                <div id="no-webcam" ref="noWebcam">
                  <span className="camera-icon"><FaCamera /></span>
                  No supported camera found.
                  Try selecting a local image instead.<br />
                  <small>You can also take a picture through your device's camera app
                  (if available) by selecting it
                  when using the "Select Local File" option.</small>
                </div>
                <div className="webcam-box-outer">
                  <div className="webcam-box-inner">
                    <video ref="webcam" autoPlay playsInline muted id="webcam"
                           width="448" height="448">
                    </video>
                  </div>
                </div>
                <div className="button-container">
                  { this.state.webcamLoaded &&
                      <LoadButton
                      variant="primary"
                      size="lg"
                      onClick={this.classifyWebcamImage}
                      isLoading={this.state.isClassifying}
                      text="Classify"
                      loadingText="Classifying..."
                    />
                  }
                </div>
              </Tab>
              <Tab eventKey="localfile" title="Select Local File">
                <Form.Group controlId="file">
                  <Form.Label>Select Image File</Form.Label><br />
                  <Form.Label className="imagelabel">
                    {this.state.filename ? this.state.filename : 'Browse...'}
                  </Form.Label>
                  <Form.Control
                    onChange={this.handleFileChange}
                    type="file"
                    accept="image/*"
                    className="imagefile" />
                </Form.Group>
                { this.state.file &&
                  <Fragment>
                    <div id="local-image">
                      <Cropper
                        ref="cropper"
                        src={this.state.file}
                        style={{height: 400, width: '100%'}}
                        guides={true}
                        viewMode={2}
                      />
                    </div>
                    <div className="button-container">
                      <LoadButton
                        variant="primary"
                        size="lg"
                        disabled={!this.state.filename}
                        onClick={this.classifyLocalImage}
                        isLoading={this.state.isClassifying}
                        text="Classify"
                        loadingText="Classifying..."
                      />
                    </div>
                  </Fragment>
                }
              </Tab>
            </Tabs>
            </div>
          </Collapse>
          { this.state.predictions.length > 0 &&
            <div className="classification-results">
              <h3>Predictions</h3>
              <canvas ref="canvas" width={CANVAS_SIZE} height={CANVAS_SIZE} />
              <br />
              <ListGroup>
              {this.state.predictions.map((category) => {
                  return (
                    <ListGroup.Item key={category.className}>
                      <strong>{category.className}</strong> {category.probability}%</ListGroup.Item>
                  );
              })}
              </ListGroup>
            </div>
          }
          </div>
        }
      </div>
    );
  }
}
