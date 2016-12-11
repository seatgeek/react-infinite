'use strict';

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

var React = global.React || require('react');

require('./utils/establish-polyfills');
var scaleEnum = require('./utils/scaleEnum');
var infiniteHelpers = require('./utils/infiniteHelpers');
var _isFinite = require('lodash.isfinite');

var preloadType = require('./utils/types').preloadType;
var checkProps = checkProps = require('./utils/checkProps');

var Infinite = React.createClass({
  displayName: 'Infinite',

  propTypes: {
    children: React.PropTypes.any,

    handleScroll: React.PropTypes.func,

    // preloadBatchSize causes updates only to
    // happen each preloadBatchSize pixels of scrolling.
    // Set a larger number to cause fewer updates to the
    // element list.
    preloadBatchSize: preloadType,
    // preloadAdditionalHeight determines how much of the
    // list above and below the container is preloaded even
    // when it is not currently visible to the user. In the
    // regular scroll implementation, preloadAdditionalHeight
    // is equal to the entire height of the list.
    preloadAdditionalHeight: preloadType, // page to screen ratio

    // The provided elementHeight can be either
    //  1. a constant: all elements are the same height
    //  2. an array containing the height of each element
    elementHeight: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.arrayOf(React.PropTypes.number)]).isRequired,
    // This is the total height of the visible window. One
    // of
    containerHeight: React.PropTypes.number,
    useWindowAsScrollContainer: React.PropTypes.bool,

    displayBottomUpwards: React.PropTypes.bool.isRequired,

    infiniteLoadBeginEdgeOffset: React.PropTypes.number,
    onInfiniteLoad: React.PropTypes.func,
    loadingSpinnerDelegate: React.PropTypes.node,

    isInfiniteLoading: React.PropTypes.bool,
    timeScrollStateLastsForAfterUserScrolls: React.PropTypes.number,

    className: React.PropTypes.string,

    styles: React.PropTypes.shape({
      scrollableStyle: React.PropTypes.object
    }).isRequired
  },
  statics: {
    containerHeightScaleFactor: function containerHeightScaleFactor(factor) {
      if (!_isFinite(factor)) {
        throw new Error('The scale factor must be a number.');
      }
      return {
        type: scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR,
        amount: factor
      };
    }
  },

  // Properties currently used but which may be
  // refactored away in the future.
  computedProps: {},
  utils: {},
  shouldAttachToBottom: false,
  preservedScrollState: 0,
  loadingSpinnerHeight: 0,
  deprecationWarned: false,

  scrollable: null,
  topSpacer: null,
  bottomSpacer: null,
  smoothScrollingWrapper: null,
  loadingSpinner: null,

  getDefaultProps: function getDefaultProps() {
    return {
      handleScroll: function handleScroll() {},

      useWindowAsScrollContainer: false,

      onInfiniteLoad: function onInfiniteLoad() {},
      loadingSpinnerDelegate: React.createElement('div', null),

      displayBottomUpwards: false,

      isInfiniteLoading: false,
      timeScrollStateLastsForAfterUserScrolls: 150,

      className: '',

      styles: {}
    };
  },

  // automatic adjust to scroll direction
  // give spinner a ReactCSSTransitionGroup
  getInitialState: function getInitialState() {
    var nextInternalState = this.recomputeInternalStateFromProps(this.props);

    this.computedProps = nextInternalState.computedProps;
    this.utils = nextInternalState.utils;
    this.shouldAttachToBottom = this.props.displayBottomUpwards;

    var state = nextInternalState.newState;
    state.scrollTimeout = undefined;
    state.isScrolling = false;

    return state;
  },

  generateComputedProps: function generateComputedProps(props) {
    // These are extracted so their type definitions do not conflict.
    var containerHeight = props.containerHeight;
    var preloadBatchSize = props.preloadBatchSize;
    var preloadAdditionalHeight = props.preloadAdditionalHeight;

    var oldProps = _objectWithoutProperties(props, ['containerHeight', 'preloadBatchSize', 'preloadAdditionalHeight']);

    var newProps = {};
    containerHeight = typeof containerHeight === 'number' ? containerHeight : 0;
    newProps.containerHeight = props.useWindowAsScrollContainer ? window.innerHeight : containerHeight;

    if (oldProps.infiniteLoadBeginBottomOffset !== undefined) {
      newProps.infiniteLoadBeginEdgeOffset = oldProps.infiniteLoadBeginBottomOffset;
      if (!this.deprecationWarned) {
        console.error('Warning: React Infinite\'s infiniteLoadBeginBottomOffset prop\n        has been deprecated as of 0.6.0. Please use infiniteLoadBeginEdgeOffset.\n        Because this is a rather descriptive name, a simple find and replace\n        should suffice.');
        this.deprecationWarned = true;
      }
    }

    var defaultPreloadBatchSizeScaling = {
      type: scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR,
      amount: 0.5
    };
    var batchSize = preloadBatchSize && preloadBatchSize.type ? preloadBatchSize : defaultPreloadBatchSizeScaling;

    if (typeof preloadBatchSize === 'number') {
      newProps.preloadBatchSize = preloadBatchSize;
    } else if (typeof batchSize === 'object' && batchSize.type === scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR) {
      newProps.preloadBatchSize = newProps.containerHeight * batchSize.amount;
    } else {
      newProps.preloadBatchSize = 0;
    }

    var defaultPreloadAdditionalHeightScaling = {
      type: scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR,
      amount: 1
    };
    var additionalHeight = preloadAdditionalHeight && preloadAdditionalHeight.type ? preloadAdditionalHeight : defaultPreloadAdditionalHeightScaling;
    if (typeof preloadAdditionalHeight === 'number') {
      newProps.preloadAdditionalHeight = preloadAdditionalHeight;
    } else if (typeof additionalHeight === 'object' && additionalHeight.type === scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR) {
      newProps.preloadAdditionalHeight = newProps.containerHeight * additionalHeight.amount;
    } else {
      newProps.preloadAdditionalHeight = 0;
    }

    return Object.assign(oldProps, newProps);
  },

  generateComputedUtilityFunctions: function generateComputedUtilityFunctions(props) {
    var _this = this;

    var utilities = {};
    utilities.getLoadingSpinnerHeight = function () {
      var loadingSpinnerHeight = 0;
      if (_this.loadingSpinner) {
        loadingSpinnerHeight = _this.loadingSpinner.offsetHeight || 0;
      }
      return loadingSpinnerHeight;
    };
    if (props.useWindowAsScrollContainer) {
      utilities.subscribeToScrollListener = function () {
        window.addEventListener('scroll', _this.infiniteHandleScroll);
      };
      utilities.unsubscribeFromScrollListener = function () {
        window.removeEventListener('scroll', _this.infiniteHandleScroll);
      };
      utilities.nodeScrollListener = function () {};
      utilities.getScrollTop = function () {
        return window.pageYOffset;
      };
      utilities.setScrollTop = function (top) {
        window.scroll(window.pageXOffset, top);
      };
      utilities.scrollShouldBeIgnored = function () {
        return false;
      };
      utilities.buildScrollableStyle = function () {
        return {};
      };
    } else {
      utilities.subscribeToScrollListener = function () {};
      utilities.unsubscribeFromScrollListener = function () {};
      utilities.nodeScrollListener = this.infiniteHandleScroll;
      utilities.getScrollTop = function () {
        return _this.scrollable ? _this.scrollable.scrollTop : 0;
      };

      utilities.setScrollTop = function (top) {
        if (_this.scrollable) {
          _this.scrollable.scrollTop = top;
        }
      };
      utilities.scrollShouldBeIgnored = function (event) {
        return event.target !== _this.scrollable;
      };

      utilities.buildScrollableStyle = function () {
        return Object.assign({}, {
          height: _this.computedProps.containerHeight,
          overflowX: 'hidden',
          overflowY: 'scroll',
          WebkitOverflowScrolling: 'touch'
        }, _this.computedProps.styles.scrollableStyle || {});
      };
    }
    return utilities;
  },

  recomputeInternalStateFromProps: function recomputeInternalStateFromProps(props) {
    checkProps(props);
    var computedProps = this.generateComputedProps(props);
    var utils = this.generateComputedUtilityFunctions(props);

    var newState = {};

    newState.numberOfChildren = React.Children.count(computedProps.children);
    newState.infiniteComputer = infiniteHelpers.createInfiniteComputer(computedProps.elementHeight, computedProps.children, computedProps.displayBottomUpwards);

    if (computedProps.isInfiniteLoading !== undefined) {
      newState.isInfiniteLoading = computedProps.isInfiniteLoading;
    }

    newState.preloadBatchSize = computedProps.preloadBatchSize;
    newState.preloadAdditionalHeight = computedProps.preloadAdditionalHeight;

    newState = Object.assign(newState, infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(newState, utils.getScrollTop()));

    return {
      computedProps: computedProps,
      utils: utils,
      newState: newState
    };
  },

  componentWillReceiveProps: function componentWillReceiveProps(nextProps) {
    var nextInternalState = this.recomputeInternalStateFromProps(nextProps);

    this.computedProps = nextInternalState.computedProps;
    this.utils = nextInternalState.utils;

    this.setState(nextInternalState.newState);
  },

  componentWillUpdate: function componentWillUpdate() {
    if (this.props.displayBottomUpwards) {
      this.preservedScrollState = this.utils.getScrollTop() - this.loadingSpinnerHeight;
    }
  },

  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    this.loadingSpinnerHeight = this.utils.getLoadingSpinnerHeight();

    if (this.props.displayBottomUpwards) {
      var lowestScrollTop = this.getLowestPossibleScrollTop();
      if (this.shouldAttachToBottom && this.utils.getScrollTop() < lowestScrollTop) {
        this.utils.setScrollTop(lowestScrollTop);
      } else if (prevProps.isInfiniteLoading && !this.props.isInfiniteLoading) {
        this.utils.setScrollTop(this.state.infiniteComputer.getTotalScrollableHeight() - prevState.infiniteComputer.getTotalScrollableHeight() + this.preservedScrollState);
      }
    }

    var hasLoadedMoreChildren = this.state.numberOfChildren !== prevState.numberOfChildren;
    if (hasLoadedMoreChildren) {
      var newApertureState = infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(this.state, this.utils.getScrollTop());
      this.setState(newApertureState);
    }

    var isMissingVisibleRows = hasLoadedMoreChildren && !this.hasAllVisibleItems() && !this.state.isInfiniteLoading;
    if (isMissingVisibleRows) {
      this.onInfiniteLoad();
    }
  },

  componentDidMount: function componentDidMount() {
    this.utils.subscribeToScrollListener();

    if (!this.hasAllVisibleItems()) {
      this.onInfiniteLoad();
    }

    if (this.props.displayBottomUpwards) {
      var lowestScrollTop = this.getLowestPossibleScrollTop();
      if (this.shouldAttachToBottom && this.utils.getScrollTop() < lowestScrollTop) {
        this.utils.setScrollTop(lowestScrollTop);
      }
    }
  },

  componentWillUnmount: function componentWillUnmount() {
    this.utils.unsubscribeFromScrollListener();
  },

  infiniteHandleScroll: function infiniteHandleScroll(e) {
    if (this.utils.scrollShouldBeIgnored(e)) {
      return;
    }
    this.computedProps.handleScroll(this.scrollable);
    this.handleScroll(this.utils.getScrollTop());
  },

  manageScrollTimeouts: function manageScrollTimeouts() {
    // Maintains a series of timeouts to set this.state.isScrolling
    // to be true when the element is scrolling.

    if (this.state.scrollTimeout) {
      clearTimeout(this.state.scrollTimeout);
    }

    var that = this,
        scrollTimeout = setTimeout(function () {
      that.setState({
        isScrolling: false,
        scrollTimeout: undefined
      });
    }, this.computedProps.timeScrollStateLastsForAfterUserScrolls);

    this.setState({
      isScrolling: true,
      scrollTimeout: scrollTimeout
    });
  },

  getLowestPossibleScrollTop: function getLowestPossibleScrollTop() {
    return this.state.infiniteComputer.getTotalScrollableHeight() - this.computedProps.containerHeight;
  },

  hasAllVisibleItems: function hasAllVisibleItems() {
    return !(_isFinite(this.computedProps.infiniteLoadBeginEdgeOffset) && this.state.infiniteComputer.getTotalScrollableHeight() < this.computedProps.containerHeight);
  },

  passedEdgeForInfiniteScroll: function passedEdgeForInfiniteScroll(scrollTop) {
    if (this.computedProps.displayBottomUpwards) {
      return !this.shouldAttachToBottom && scrollTop < this.computedProps.infiniteLoadBeginEdgeOffset;
    } else {
      return scrollTop > this.state.infiniteComputer.getTotalScrollableHeight() - this.computedProps.containerHeight - this.computedProps.infiniteLoadBeginEdgeOffset;
    }
  },

  onInfiniteLoad: function onInfiniteLoad() {
    this.setState({ isInfiniteLoading: true });
    this.computedProps.onInfiniteLoad();
  },

  handleScroll: function handleScroll(scrollTop) {
    this.shouldAttachToBottom = this.computedProps.displayBottomUpwards && scrollTop >= this.getLowestPossibleScrollTop();

    this.manageScrollTimeouts();

    var newApertureState = infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(this.state, scrollTop);

    if (this.passedEdgeForInfiniteScroll(scrollTop) && !this.state.isInfiniteLoading) {
      this.setState(Object.assign({}, newApertureState));
      this.onInfiniteLoad();
    } else {
      this.setState(newApertureState);
    }
  },

  buildHeightStyle: function buildHeightStyle(height) {
    return {
      width: '100%',
      height: Math.ceil(height)
    };
  },

  render: function render() {
    var _this2 = this;

    var displayables;
    if (this.state.numberOfChildren > 1) {
      displayables = this.computedProps.children.slice(this.state.displayIndexStart, this.state.displayIndexEnd + 1);
    } else {
      displayables = this.computedProps.children;
    }

    var infiniteScrollStyles = {};
    if (this.state.isScrolling) {
      infiniteScrollStyles.pointerEvents = 'none';
    }

    var topSpacerHeight = this.state.infiniteComputer.getTopSpacerHeight(this.state.displayIndexStart),
        bottomSpacerHeight = this.state.infiniteComputer.getBottomSpacerHeight(this.state.displayIndexEnd);

    // This asymmetry is due to a reluctance to use CSS to control
    // the bottom alignment
    if (this.computedProps.displayBottomUpwards) {
      var heightDifference = this.computedProps.containerHeight - this.state.infiniteComputer.getTotalScrollableHeight();
      if (heightDifference > 0) {
        topSpacerHeight = heightDifference - this.loadingSpinnerHeight;
      }
    }

    var loadingSpinner = this.computedProps.infiniteLoadBeginEdgeOffset === undefined ? null : this.state.isInfiniteLoading ? this.computedProps.loadingSpinnerDelegate : null;

    // topSpacer and bottomSpacer take up the amount of space that the
    // rendered elements would have taken up otherwise
    return React.createElement(
      'div',
      { className: this.computedProps.className,
        ref: function (c) {
          _this2.scrollable = c;
        },
        style: this.utils.buildScrollableStyle(),
        onScroll: this.utils.nodeScrollListener },
      React.createElement('div', { ref: function (c) {
          _this2.topSpacer = c;
        },
        style: this.buildHeightStyle(topSpacerHeight) }),
      this.computedProps.displayBottomUpwards && loadingSpinner,
      displayables,
      !this.computedProps.displayBottomUpwards && loadingSpinner,
      React.createElement('div', { ref: function (c) {
          _this2.bottomSpacer = c;
        },
        style: this.buildHeightStyle(bottomSpacerHeight) })
    );
  }
});

module.exports = Infinite;
global.Infinite = Infinite;