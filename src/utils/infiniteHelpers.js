/* @flow */

var ConstantInfiniteComputer = require('../computers/constantInfiniteComputer.js');
var ArrayInfiniteComputer = require('../computers/arrayInfiniteComputer.js');
var scaleEnum = require('./scaleEnum');
var React = global.React || require('react');
var window = require('./window');

function createInfiniteComputer(
  data: ElementHeight,
  children: any
): InfiniteComputer {
  var computer;
  var numberOfChildren = React.Children.count(children);

  // This should be guaranteed by checkProps
  if (Array.isArray(data)) {
    computer = new ArrayInfiniteComputer(data, numberOfChildren);
  } else {
    computer = new ConstantInfiniteComputer(data, numberOfChildren);
  }
  return computer;
}

// Given the scrollTop of the container, computes the state the
// component should be in. The goal is to abstract all of this
// from any actual representation in the DOM.
// The window is the block with any preloadAdditionalHeight
// added to it.
function recomputeApertureStateFromOptionsAndScrollTop(
  {
    preloadBatchSize,
    preloadAdditionalHeight,
    infiniteComputer
  }: {
    preloadBatchSize: number,
    preloadAdditionalHeight: number,
    infiniteComputer: InfiniteComputer
  },
  scrollTop: number
): {
  displayIndexStart: number,
  displayIndexEnd: number
} {
  var blockNumber =
      preloadBatchSize === 0 ? 0 : Math.floor(scrollTop / preloadBatchSize),
    blockStart = preloadBatchSize * blockNumber,
    blockEnd = blockStart + preloadBatchSize,
    apertureTop = Math.max(0, blockStart - preloadAdditionalHeight),
    apertureBottom = Math.min(
      infiniteComputer.getTotalScrollableHeight(),
      blockEnd + preloadAdditionalHeight
    );

  return {
    displayIndexStart: infiniteComputer.getDisplayIndexStart(apertureTop),
    displayIndexEnd: infiniteComputer.getDisplayIndexEnd(apertureBottom)
  };
}

function generateComputedProps(
  props: ReactInfiniteProps
): ReactInfiniteComputedProps {
  // These are extracted so their type definitions do not conflict.
  var {
    containerHeight,
    preloadBatchSize,
    preloadAdditionalHeight,
    handleScroll,
    onInfiniteLoad,
    ...oldProps
  } = props;

  var newProps = {};
  containerHeight = typeof containerHeight === 'number' ? containerHeight : 0;
  newProps.containerHeight = props.useWindowAsScrollContainer
    ? window.innerHeight
    : containerHeight;

  newProps.handleScroll = handleScroll || (() => {});
  newProps.onInfiniteLoad = onInfiniteLoad || (() => {});

  var defaultPreloadBatchSizeScaling = {
    type: scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR,
    amount: 0.5
  };
  var batchSize =
    preloadBatchSize && preloadBatchSize.type
      ? preloadBatchSize
      : defaultPreloadBatchSizeScaling;

  if (typeof preloadBatchSize === 'number') {
    newProps.preloadBatchSize = preloadBatchSize;
  } else if (
    typeof batchSize === 'object' &&
    batchSize.type === scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR
  ) {
    newProps.preloadBatchSize = newProps.containerHeight * batchSize.amount;
  } else {
    newProps.preloadBatchSize = 0;
  }

  var defaultPreloadAdditionalHeightScaling = {
    type: scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR,
    amount: 1
  };
  var additionalHeight =
    preloadAdditionalHeight && preloadAdditionalHeight.type
      ? preloadAdditionalHeight
      : defaultPreloadAdditionalHeightScaling;
  if (typeof preloadAdditionalHeight === 'number') {
    newProps.preloadAdditionalHeight = preloadAdditionalHeight;
  } else if (
    typeof additionalHeight === 'object' &&
    additionalHeight.type === scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR
  ) {
    newProps.preloadAdditionalHeight =
      newProps.containerHeight * additionalHeight.amount;
  } else {
    newProps.preloadAdditionalHeight = 0;
  }

  return Object.assign(oldProps, newProps);
}

function buildHeightStyle(height: number): CSSStyle {
  return {
    width: '100%',
    height: Math.ceil(height)
  };
}

module.exports = {
  createInfiniteComputer,
  recomputeApertureStateFromOptionsAndScrollTop,
  generateComputedProps,
  buildHeightStyle
};
