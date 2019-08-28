import React, { Component } from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { FaSearch } from 'react-icons/fa';
import './Home.css';

/**
 * Class to handle the rendering of the Home page.
 * @extends React.Component
 */
export default class Home extends Component {
  render() {
    return (
      <div className="Home">
        <div className="lander">
          <h3>Select Task</h3>
        </div>
        <Container className="tilecontainer">
          <Row className="show-grid">
            <Col md={6}>
              <a href="/classify?model=snails" title="Classify Snail" className="menubutton">
                <h4><strong>Classify Snail</strong></h4>
                <p className="icon"><FaSearch /></p>
              </a>
            </Col>
            <Col md={6}>
              <a href="/classify?model=parasites" title="Classify Parasite" className="menubutton">
                <h4><strong>Classify Parasite</strong></h4>
                <p className="icon"><FaSearch /></p>
              </a>
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}
