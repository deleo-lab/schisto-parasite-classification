import React from 'react';
import { Route, Switch } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import Classify from './pages/Classify';
import NotFound from './pages/NotFound';

export default ({ childProps }) =>
  <Switch>
    <Route path="/" exact component={Home} props={childProps} />
    <Route path="/classify" exact component={Classify} props={childProps} />
    <Route path="/about" exact component={About} props={childProps} />
    <Route component={NotFound} />
  </Switch>;
