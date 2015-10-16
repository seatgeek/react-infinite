var _isArray = require('lodash.isarray');
var _isFinite = require('lodash.isfinite');
var ConstantInfiniteComputer = require('../computers/ConstantInfiniteComputer.js');
var ArrayInfiniteComputer = require('../computers/ArrayInfiniteComputer.js');
var React = global.React || require('react');

function createInfiniteComputer(data, children) {
  var computer;
  var numberOfChildren = React.Children.count(children);

  // This should be guaranteed by checkProps
  if (_isFinite(data)) {
    computer = new ConstantInfiniteComputer(data, numberOfChildren);
  } else if (_isArray(data)) {
    computer = new ArrayInfiniteComputer(data, numberOfChildren);
  }

  return computer;
}

// Given the scrollTop of the container, computes the state the
// component should be in. The goal is to abstract all of this
// from any actual representation in the DOM.
// The window is the block with any preloadAdditionalHeight
// added to it.
function recomputeApertureStateFromOptionsAndScrollTop({
  preloadBatchSize,
  preloadAdditionalHeight,
  infiniteComputer
  }, scrollTop) {
  var blockNumber = preloadBatchSize === 0 ? 0 : Math.floor(scrollTop / preloadBatchSize),
      blockStart = preloadBatchSize * blockNumber,
      blockEnd = blockStart + preloadBatchSize,
      apertureTop = Math.max(0, blockStart - preloadAdditionalHeight),
      apertureBottom = Math.min(infiniteComputer.getTotalScrollableHeight(),
        blockEnd + preloadAdditionalHeight);

  return {
    displayIndexStart: infiniteComputer.getDisplayIndexStart(apertureTop),
    displayIndexEnd: infiniteComputer.getDisplayIndexEnd(apertureBottom)
  };
}

module.exports = {
  createInfiniteComputer,
  recomputeApertureStateFromOptionsAndScrollTop
};
