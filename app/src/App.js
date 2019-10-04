import { PropTypes } from 'prop-types';
import React, { Component } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { Col, Container, Image, Nav, Navbar, Row } from 'react-bootstrap';
import { FaGithub } from 'react-icons/fa';
import AlertDismissable from './components/AlertDismissable';
import Routes from './Routes';
import './App.css';


class App extends Component {

  constructor(props) {
    super(props);
    const reloadMsg = `
      New content is available.<br />
      Please <a href='javascript:location.reload();'>reload</a>.<br />
      <small>If reloading doesn't work, close all tabs/windows of this web application,
      and then reopen the application.</small>
    `;
    this.state = {
      showUpdateAlert: true,
      reloadMsg: reloadMsg
    };
  }

  dismissUpdateAlert = event => {
    this.setState({ showUpdateAlert: false });
  }

  render() {
    return (
        <div className="App">
          <Navbar collapseOnSelect className="app-nav-bar" variant="dark" expand="lg">
            <Container>
              <Navbar.Brand href="/">SchistoClassify</Navbar.Brand>
              <Navbar.Toggle aria-controls="basic-navbar-nav" />
              <Navbar.Collapse id="basic-navbar-nav">
                <Nav className="">
                  <Link className="nav-link" to="/classify">Classify</Link>
                  <Link className="nav-link" to="/about">About</Link>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
          <Container>
            { this.props.updateAvailable && this.state.showUpdateAlert &&
              <div style={{paddingTop: '10px'}}>
                <AlertDismissable
                  title=""
                  variant="info"
                  message={this.state.reloadMsg}
                  show={this.props.updateAvailable && this.state.showUpdateAlert}
                  onClose={this.dismissUpdateAlert} />
              </div>
            }
          </Container>
          <Container className="app-content">
            <div>
              <Routes />
            </div>
          </Container>

          <footer className="footer">
            <Container>
              <Row>
                <Col className="icon-links pt-4" xs="12" md="3" >
                  <a title="GitHub Link"
                     href="https://github.com/deleo-lab/schisto-parasite-classification"
                     target="_blank" rel="noopener noreferrer">
                     <FaGithub size="3em" />
                  </a>
                </Col>
                <Col className="logos" xs="12" md="9">
                  <a href="https://ibm.org/"
                     title="International Business Machines"
                     target="_blank" rel="noopener noreferrer">
                    <Image src="images/ibm-logo.svg"
                           style={{'max-width': '100px', 'margin-top': '20px'}} />
                  </a>
                  <a href="https://ecohealthsolutions.stanford.edu/"
                     title="Program for Disease Ecology, Health and the Environment"
                     target="_blank" rel="noopener noreferrer">
                    <Image src="images/stanford-disease-logo-horizontal.png"
                           style={{'max-width': '280px'}} />
                  </a>
                  <a href="http://www.theupstreamalliance.org/"
                     title="The Upstream Alliance"
                     target="_blank" rel="noopener noreferrer">
                    <Image src="images/upstream-alliance-logo.png"
                           style={{'max-width': '200px', 'margin-top': '20px'}} />
                  </a>
                </Col>
              </Row>
            </Container>
          </footer>
        </div>
    );
  }
}

App.propTypes = {
  updateAvailable: PropTypes.bool.isRequired,
};

export default withRouter(App);
