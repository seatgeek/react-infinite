/* @flow */

var React = global.React || require('react');
var PropTypes = global.PropTypes || require('prop-types');
var createReactClass = global.createReactClass || require('create-react-class');

require('./utils/establish-polyfills');
var scaleEnum = require('./utils/scaleEnum');
var infiniteHelpers = require('./utils/infiniteHelpers');
var _isFinite = require('lodash.isfinite');

var preloadType = require('./utils/types').preloadType;
var checkProps = checkProps = require('./utils/checkProps');

var Infinite = createReactClass({
  propTypes: {
    children: PropTypes.any,

    handleScroll: PropTypes.func,

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
    }).isRequired,

    onChangeScrollState: PropTypes.func
  },
  statics: {
    containerHeightScaleFactor(factor) {
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

  getDefaultProps(): ReactInfiniteProvidedDefaultProps {
    return {

      useWindowAsScrollContainer: false,

      onInfiniteLoad: () => {
      },
      loadingSpinnerDelegate: <div/>,

      displayBottomUpwards: false,

      isInfiniteLoading: false,
      timeScrollStateLastsForAfterUserScrolls: 150,

      className: '',

      styles: {}
    };
  },

  // automatic adjust to scroll direction
  // give spinner a ReactCSSTransitionGroup
  getInitialState() {
    var nextInternalState = this.recomputeInternalStateFromProps(this.props);

    this.computedProps = nextInternalState.computedProps;
    this.utils = nextInternalState.utils;
    this.shouldAttachToBottom = this.props.displayBottomUpwards;

    var state = nextInternalState.newState;
    state.scrollTimeout = undefined;
    state.isScrolling = false;

    return state;
  },

  generateComputedProps(props: ReactInfiniteProps): ReactInfiniteComputedProps {
    // These are extracted so their type definitions do not conflict.
    var {containerHeight,
          preloadBatchSize,
          preloadAdditionalHeight,
          ...oldProps} = props;

    var newProps = {};
    containerHeight = typeof containerHeight === 'number' ? containerHeight : 0;
    newProps.containerHeight = props.useWindowAsScrollContainer
      ? window.innerHeight : containerHeight;

    if (oldProps.infiniteLoadBeginBottomOffset !== undefined) {
      newProps.infiniteLoadBeginEdgeOffset = oldProps.infiniteLoadBeginBottomOffset;
      if (!this.deprecationWarned) {
        console.error(`Warning: React Infinite's infiniteLoadBeginBottomOffset prop
        has been deprecated as of 0.6.0. Please use infiniteLoadBeginEdgeOffset.
        Because this is a rather descriptive name, a simple find and replace
        should suffice.`);
        this.deprecationWarned = true;
      }
    }

    var defaultPreloadBatchSizeScaling = {
      type: scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR,
      amount: 0.5
    };
    var batchSize = preloadBatchSize && preloadBatchSize.type
      ? preloadBatchSize
      : defaultPreloadBatchSizeScaling;

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
    var additionalHeight = preloadAdditionalHeight && preloadAdditionalHeight.type
      ? preloadAdditionalHeight
      : defaultPreloadAdditionalHeightScaling;
    if (typeof preloadAdditionalHeight === 'number') {
      newProps.preloadAdditionalHeight = preloadAdditionalHeight;
    } else if (typeof additionalHeight === 'object' && additionalHeight.type === scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR) {
      newProps.preloadAdditionalHeight = newProps.containerHeight * additionalHeight.amount;
    } else {
      newProps.preloadAdditionalHeight = 0;
    }

    return Object.assign(oldProps, newProps);
  },

  generateComputedUtilityFunctions(props: ReactInfiniteProps): ReactInfiniteUtilityFunctions {
    var utilities = {};
    utilities.getLoadingSpinnerHeight = () => {
      var loadingSpinnerHeight = 0;
      if (this.loadingSpinner) {
        loadingSpinnerHeight = this.loadingSpinner.offsetHeight || 0;
      }
      return loadingSpinnerHeight;
    };
    if (props.useWindowAsScrollContainer) {
      utilities.subscribeToScrollListener = () => {
        window.addEventListener('scroll', this.infiniteHandleScroll);
      };
      utilities.unsubscribeFromScrollListener = () => {
        window.removeEventListener('scroll', this.infiniteHandleScroll);
      };
      utilities.nodeScrollListener = null;
      utilities.getScrollTop = () => window.pageYOffset;
      utilities.setScrollTop = (top) => {
        window.scroll(window.pageXOffset, top);
      };
      utilities.scrollShouldBeIgnored = () => false;
      utilities.buildScrollableStyle = () => ({});
    } else {
      utilities.subscribeToScrollListener = () => {};
      utilities.unsubscribeFromScrollListener = () => {};
      utilities.nodeScrollListener = this.infiniteHandleScroll;
      utilities.getScrollTop = () => {
        return this.scrollable ? this.scrollable.scrollTop : 0;
      };

      utilities.setScrollTop = (top) => {
        if (this.scrollable) {
          this.scrollable.scrollTop = top;
        }
      };
      utilities.scrollShouldBeIgnored = event => event.target !== this.scrollable;

      utilities.buildScrollableStyle = () => {
        return Object.assign({}, {
          height: this.computedProps.containerHeight,
          overflowX: 'hidden',
          overflowY: 'scroll',
          WebkitOverflowScrolling: 'touch'
        }, this.computedProps.styles.scrollableStyle || {});
      };
    }
    return utilities;
  },

  recomputeInternalStateFromProps(props: ReactInfiniteProps): {
    computedProps: ReactInfiniteComputedProps,
    utils: ReactInfiniteUtilityFunctions,
    newState: ReactInfiniteState
    } {
    checkProps(props);
    var computedProps = this.generateComputedProps(props);
    var utils = this.generateComputedUtilityFunctions(props);

    var newState = {};

    newState.numberOfChildren = React.Children.count(computedProps.children);
    newState.infiniteComputer = infiniteHelpers.createInfiniteComputer(
      computedProps.elementHeight,
      computedProps.children,
      computedProps.displayBottomUpwards
    );

    if (computedProps.isInfiniteLoading !== undefined) {
      newState.isInfiniteLoading = computedProps.isInfiniteLoading;
    }

    newState.preloadBatchSize = computedProps.preloadBatchSize;
    newState.preloadAdditionalHeight = computedProps.preloadAdditionalHeight;

    newState = Object.assign(newState,
      infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
        newState, utils.getScrollTop()));

    return {
      computedProps,
      utils,
      newState
    };
  },

  componentWillReceiveProps(nextProps: ReactInfiniteProps) {
    var nextInternalState = this.recomputeInternalStateFromProps(nextProps);

    this.computedProps = nextInternalState.computedProps;
    this.utils = nextInternalState.utils;

    this.setState(nextInternalState.newState);
  },

  componentWillUpdate() {
    if (this.props.displayBottomUpwards) {
      this.preservedScrollState = this.utils.getScrollTop() - this.loadingSpinnerHeight;
    }
  },

  componentDidUpdate(prevProps: ReactInfiniteProps, prevState: ReactInfiniteState) {
    this.loadingSpinnerHeight = this.utils.getLoadingSpinnerHeight();

    if (this.props.displayBottomUpwards) {
      var lowestScrollTop = this.getLowestPossibleScrollTop();
      if (this.shouldAttachToBottom && this.utils.getScrollTop() < lowestScrollTop) {
        this.utils.setScrollTop(lowestScrollTop);
      } else if (prevProps.isInfiniteLoading && !this.props.isInfiniteLoading) {
        this.utils.setScrollTop(this.state.infiniteComputer.getTotalScrollableHeight() -
          prevState.infiniteComputer.getTotalScrollableHeight() +
          this.preservedScrollState);
      }
    }

    const hasLoadedMoreChildren = this.state.numberOfChildren !== prevState.numberOfChildren;
    if (hasLoadedMoreChildren) {
      var newApertureState = infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
        this.state,
        this.utils.getScrollTop()
      );
      this.setState(newApertureState);
    }

    if (typeof this.props.onChangeScrollState === 'function') {
      if (this.state.isScrolling !== prevState.isScrolling) {
        return this.props.onChangeScrollState(this.state.isScrolling);
      }
    }

    const isMissingVisibleRows = hasLoadedMoreChildren && !this.hasAllVisibleItems() && !this.state.isInfiniteLoading;
    if (isMissingVisibleRows) {
      this.onInfiniteLoad();
    }
  },

  componentDidMount() {
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

  componentWillUnmount() {
    this.utils.unsubscribeFromScrollListener();
  },

  infiniteHandleScroll(e: SyntheticEvent) {
    if (this.utils.scrollShouldBeIgnored(e)) {
      return;
    }
    if (typeof this.computedProps.handleScroll === 'function') { this.computedProps.handleScroll(this.scrollable); }
    this.handleScroll(this.utils.getScrollTop());
  },

  manageScrollTimeouts() {
    // Maintains a series of timeouts to set this.state.isScrolling
    // to be true when the element is scrolling.

    if (this.state.scrollTimeout) {
      clearTimeout(this.state.scrollTimeout);
    }

    var that = this,
        scrollTimeout = setTimeout(() => {
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

  getLowestPossibleScrollTop(): number {
    return this.state.infiniteComputer.getTotalScrollableHeight() - this.computedProps.containerHeight;
  },

  hasAllVisibleItems(): boolean {
    return !(_isFinite(this.computedProps.infiniteLoadBeginEdgeOffset) &&
        this.state.infiniteComputer.getTotalScrollableHeight() < this.computedProps.containerHeight);
  },

  passedEdgeForInfiniteScroll(scrollTop: number): boolean {
    if (this.computedProps.displayBottomUpwards) {
      return !this.shouldAttachToBottom && scrollTop < this.computedProps.infiniteLoadBeginEdgeOffset;
    } else {
      return scrollTop > this.state.infiniteComputer.getTotalScrollableHeight() -
          this.computedProps.containerHeight -
          this.computedProps.infiniteLoadBeginEdgeOffset;
    }
  },

  onInfiniteLoad() {
    this.setState({ isInfiniteLoading: true });
    this.computedProps.onInfiniteLoad();
  },

  handleScroll(scrollTop: number) {
    this.shouldAttachToBottom = this.computedProps.displayBottomUpwards &&
        scrollTop >= this.getLowestPossibleScrollTop();

    this.manageScrollTimeouts();

    var newApertureState = infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
      this.state,
      scrollTop
    );

    if (this.passedEdgeForInfiniteScroll(scrollTop) && !this.state.isInfiniteLoading) {
      this.setState(Object.assign({}, newApertureState));
      this.onInfiniteLoad();
    } else {
      this.setState(newApertureState);
    }
  },

  buildHeightStyle(height: number): CSSStyle {
    return {
      width: '100%',
      height: Math.ceil(height)
    };
  },

  render(): React.Element<any, any, any> {
    var displayables;
    if (this.state.numberOfChildren > 1) {
      displayables = this.computedProps.children.slice(this.state.displayIndexStart,
                                                       this.state.displayIndexEnd + 1);
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

    var loadingSpinner = this.computedProps.infiniteLoadBeginEdgeOffset === undefined
      ? null
      : <div ref={(c) => { this.loadingSpinner = c; }}>
        {this.state.isInfiniteLoading ? this.computedProps.loadingSpinnerDelegate : null}
      </div>;

    // topSpacer and bottomSpacer take up the amount of space that the
    // rendered elements would have taken up otherwise
    return (
      <div className={this.computedProps.className}
        ref={(c) => { this.scrollable = c; }}
        style={this.utils.buildScrollableStyle()}
        onScroll={this.utils.nodeScrollListener}>
        <div ref={(c) => { this.smoothScrollingWrapper = c; }} style={infiniteScrollStyles}>
          <div ref={(c) => { this.topSpacer = c; }} style={this.buildHeightStyle(topSpacerHeight)}/>
          {this.computedProps.displayBottomUpwards && loadingSpinner}
          {displayables}
          {!this.computedProps.displayBottomUpwards && loadingSpinner}
          <div ref={(c) => { this.bottomSpacer = c; }} style={this.buildHeightStyle(bottomSpacerHeight)}/>
        </div>
      </div>
    );
  }
});

module.exports = Infinite;
global.Infinite = Infinite;
