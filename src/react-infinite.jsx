/* @flow */

var React = global.React || require('react');
require('./utils/polyfill-object-assign');
var checkProps = require('./utils/checkProps');
var preloadType = require('./utils/types').preloadType;
var scaleEnum = require('./utils/scaleEnum');
var infiniteHelpers = require('./utils/infiniteHelpers');
var _isFinite = require('lodash.isfinite');

var Infinite = React.createClass({

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
    elementHeight: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.arrayOf(React.PropTypes.number)
    ]).isRequired,
    // This is the total height of the visible window. One
    // of
    containerHeight: React.PropTypes.number.isRequired,
    useWindowAsScrollContainer: React.PropTypes.bool,

    infiniteLoadBeginBottomOffset: React.PropTypes.number,
    onInfiniteLoad: React.PropTypes.func,
    loadingSpinnerDelegate: React.PropTypes.node,

    isInfiniteLoading: React.PropTypes.bool,
    timeScrollStateLastsForAfterUserScrolls: React.PropTypes.number,

    className: React.PropTypes.string
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

  getDefaultProps(): ReactInfiniteProvidedDefaultProps {
    return {
      handleScroll: () => {},

      useWindowAsScrollContainer: false,

      onInfiniteLoad: () => {},
      loadingSpinnerDelegate: <div/>,

      isInfiniteLoading: false,
      timeScrollStateLastsForAfterUserScrolls: 150,

      className: ''
    };
  },

  // automatic adjust to scroll direction
  // give spinner a ReactCSSTransitionGroup
  getInitialState() {
    var nextInternalState = this.recomputeInternalStateFromProps(this.props);

    this.computedProps = nextInternalState.computedProps;
    this.utils = nextInternalState.utils;

    var state = nextInternalState.newState;
    state.scrollTimeout = undefined;
    state.isScrolling = false;

    return state;
  },

  generateComputedProps(props: ReactInfiniteProps): ReactInfiniteProps {
    var computedProps = Object.assign({}, props);
    computedProps.containerHeight = props.useWindowAsScrollContainer
      ? window.innerHeight : props.containerHeight;

    var defaultPreloadBatchSizeScaling = {
      type: scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR,
      amount: 0.5
    };
    var batchSize = props.preloadBatchSize && props.preloadBatchSize.type
      ? props.preloadBatchSize
      : defaultPreloadBatchSizeScaling;
    if (_isFinite(props.preloadBatchSize)) {
      computedProps.preloadBatchSize = props.preloadBatchSize;
    } else if (batchSize.type === scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR) {
      computedProps.preloadBatchSize = computedProps.containerHeight * batchSize.amount;
    }

    var defaultPreloadAdditionalHeightScaling = {
      type: scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR,
      amount: 1
    };
    var additionalHeight = props.preloadAdditionalHeight && props.preloadAdditionalHeight.type
      ? props.preloadAdditionalHeight
      : defaultPreloadAdditionalHeightScaling;
    if (_isFinite(props.preloadAdditionalHeight)) {
      computedProps.preloadAdditionalHeight = props.preloadAdditionalHeight;
    } else if (additionalHeight.type === scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR) {
      computedProps.preloadAdditionalHeight = computedProps.containerHeight * additionalHeight.amount;
    }

    return computedProps;
  },

  generateComputedUtilityFunctions(props: ReactInfiniteProps): ReactInfiniteUtilityFunctions {
    var utilities = {};
    if (props.useWindowAsScrollContainer) {
      utilities.subscribeToScrollListener = () => {
        window.addEventListener('scroll', this.infiniteHandleScroll);
      };
      utilities.unsubscribeFromScrollListener = () => {
        window.removeEventListener('scroll', this.infiniteHandleScroll);
      };
      utilities.nodeScrollListener = () => {};
      utilities.getScrollTop = () => window.scrollY;
      utilities.scrollShouldBeIgnored = () => false;
      utilities.buildScrollableStyle = () => ({});
    } else {
      utilities.subscribeToScrollListener = () => {};
      utilities.unsubscribeFromScrollListener = () => {};
      utilities.nodeScrollListener = this.infiniteHandleScroll;
      utilities.getScrollTop = () => {
        var scrollable;
        if (this.refs && this.refs.scrollable) {
          scrollable = React.findDOMNode(this.refs.scrollable);
        }
        return scrollable ? scrollable.scrollTop : 0;
      };
      utilities.scrollShouldBeIgnored = event => event.target !== React.findDOMNode(this.refs.scrollable);
      utilities.buildScrollableStyle = () => {
        return {
          height: this.computedProps.containerHeight,
          overflowX: 'hidden',
          overflowY: 'scroll',
          WebkitOverflowScrolling: 'touch'
        };
      };
    }
    return utilities;
  },

  recomputeInternalStateFromProps(props: ReactInfiniteProps): {
    computedProps: ReactInfiniteProps,
    utils: ReactInfiniteUtilityFunctions,
    newState: ReactInfiniteState
    } {
    checkProps(props);
    var computedProps = this.generateComputedProps(props);
    var utils = this.generateComputedUtilityFunctions(props);

    var newState = {
      numberOfChildren: React.Children.count(computedProps.children),
      infiniteComputer: infiniteHelpers.createInfiniteComputer(
        computedProps.elementHeight,
        computedProps.children
      ),
      preloadBatchSize: computedProps.preloadBatchSize,
      preloadAdditionalHeight: computedProps.preloadAdditionalHeight,
      isInfiniteLoading: computedProps.isInfiniteLoading !== undefined
    };

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

  componentDidUpdate(prevProps: ReactInfiniteProps) {
    if (React.Children.count(this.props.children) !== React.Children.count(prevProps.children)) {
      var newApertureState = infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
        this.state,
        this.utils.getScrollTop()
      );
      this.setState(newApertureState);
    }
  },

  componentDidMount() {
    this.utils.subscribeToScrollListener();
    if (_isFinite(this.computedProps.infiniteLoadBeginBottomOffset) &&
        this.state.infiniteComputer.getTotalScrollableHeight() < this.computedProps.containerHeight) {
      this.setState({
        isInfiniteLoading: true
      });
      this.computedProps.onInfiniteLoad();
    }
  },

  componentWillUnmount() {
    this.utils.unsubscribeFromScrollListener();
  },

  infiniteHandleScroll(e: SyntheticEvent) {
    if (this.utils.scrollShouldBeIgnored(e)) {
      return;
    }
    this.computedProps.handleScroll(React.findDOMNode(this.refs.scrollable));
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

  handleScroll(scrollTop: number) {
    this.manageScrollTimeouts();

    var newApertureState = infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
      this.state,
      scrollTop
    );

    var infiniteScrollBottomLimit = scrollTop >
        (this.state.infiniteComputer.getTotalScrollableHeight() -
          this.computedProps.containerHeight -
          this.computedProps.infiniteLoadBeginBottomOffset);
    if (infiniteScrollBottomLimit && !this.state.isInfiniteLoading) {
      this.setState(Object.assign(newApertureState, {
        isInfiniteLoading: true
      }));
      this.computedProps.onInfiniteLoad();
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

  render(): ReactElement<any, any, any> {
    var displayables;
    if (React.Children.count(this.computedProps.children) > 1) {
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

    // topSpacer and bottomSpacer take up the amount of space that the
    // rendered elements would have taken up otherwise
    return <div className={this.computedProps.className}
                ref="scrollable"
                style={this.utils.buildScrollableStyle()}
                onScroll={this.utils.nodeScrollListener}>
      <div ref="smoothScrollingWrapper" style={infiniteScrollStyles}>
        <div ref="topSpacer"
             style={this.buildHeightStyle(topSpacerHeight)}/>
            {displayables}
        <div ref="bottomSpacer"
             style={this.buildHeightStyle(bottomSpacerHeight)}/>
        <div ref="loadingSpinner">
             {this.state.isInfiniteLoading ? this.computedProps.loadingSpinnerDelegate : null}
        </div>
      </div>
    </div>;
  }
});

module.exports = Infinite;
global.Infinite = Infinite;
