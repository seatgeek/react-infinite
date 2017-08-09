var PropTypes = global.PropTypes || require('prop-types');

export default {
  children: PropTypes.any,

  handleScroll: PropTypes.func,

  // preloadBatchSize causes updates only to
  // happen each preloadBatchSize pixels of scrolling.
  // Set a larger number to cause fewer updates to the
  // element list.
  preloadBatchSize: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      type: PropTypes.oneOf(['containerHeightScaleFactor']).isRequired,
      amount: PropTypes.number.isRequired
    })
  ]),
  // preloadAdditionalHeight determines how much of the
  // list above and below the container is preloaded even
  // when it is not currently visible to the user. In the
  // regular scroll implementation, preloadAdditionalHeight
  // is equal to the entire height of the list.
  preloadAdditionalHeight: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.shape({
      type: PropTypes.oneOf(['containerHeightScaleFactor']).isRequired,
      amount: PropTypes.number.isRequired
    })
  ]), // page to screen ratio

  // The provided elementHeight can be either
  //  1. a constant: all elements are the same height
  //  2. an array containing the height of each element
  elementHeight: PropTypes.oneOfType([
    PropTypes.number,
    PropTypes.arrayOf(PropTypes.number)
  ]).isRequired,
  // This is the total height of the visible window. One
  // of
  containerHeight: PropTypes.number,
  useWindowAsScrollContainer: PropTypes.bool,

  displayBottomUpwards: PropTypes.bool.isRequired,

  infiniteLoadBeginEdgeOffset: PropTypes.number,
  onInfiniteLoad: PropTypes.func,
  loadingSpinnerDelegate: PropTypes.node,

  isInfiniteLoading: PropTypes.bool,
  timeScrollStateLastsForAfterUserScrolls: PropTypes.number,

  className: PropTypes.string,

  styles: PropTypes.shape({
    scrollableStyle: PropTypes.object
  }).isRequired
};
