// This module provides a centralized place for
// runtime checking that the props passed to React Infinite
// make the minimum amount of sense.

var React = global.React || require('react');
var _isArray = require('lodash.isarray');
var _isFinite = require('lodash.isfinite');

module.exports = function(props) {
  if (!(props.containerHeight || props.useWindowAsScrollContainer)) {
    throw new Error('Either containerHeight or useWindowAsScrollContainer must be provided.');
  }

  if (!(_isFinite(props.elementHeight) || _isArray(props.elementHeight))) {
    throw new Error('You must provide either a number or an array of numbers as the elementHeight prop.');
  }

  if (_isArray(props.elementHeight)) {
    if (React.Children.count(props.children) !== props.elementHeight.length) {
      throw new Error('There must be as many values provided in the elementHeight prop as there are children.');
    }
  }
};
