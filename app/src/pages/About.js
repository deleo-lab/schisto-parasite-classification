import React, { Component } from 'react';
import './About.css';

/**
 * Class to handle the rendering of the Home page.
 * @extends React.Component
 */
export default class Home extends Component {
  render() {
    return (
      <div className="About container">
        <h1>About</h1>
        <p>
          This is a <a title="TensorFlow.js Website" href="https://www.tensorflow.org/js/">
            TensorFlow.js</a> web application where users can classify parasite or snail images
          associated with schistosomiasis. The images can either be selected locally or
          taken with their device's camera. The app uses TensorFlow.js and a pre-trained model
          converted to the TensorFlow.js format to provide the inference capabilities.
          The models are saved locally in the browser using IndexedDB. A service worker is also used
          to provide offline capabilities.

          <br /><br />
          This app was created by the IBM Cognitive Open Technologies Group in conjunction
          with the Stanford <a href="https://deleolab.stanford.edu/" title="De Leo Lab">
          De Leo Lab</a>. More info about this project can be
          found <a title="GitHub Link"
            href="https://github.com/deleo-lab/schisto-parasite-classification">
              in the GitHub repository.
          </a>
        </p>
      </div>
    );
  }
}
