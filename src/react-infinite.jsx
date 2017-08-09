/* @flow */

import WindowAsContainerScrollUtils from './scrollUtils/windowAsContainerScrollUtils';
import ScrollUtils from './scrollUtils/scrollUtils';

var React = global.React || require('react');
var propTypes = require('./types/propTypes');

var window = require('./utils/window');

require('./utils/establish-polyfills');
var scaleEnum = require('./utils/scaleEnum');
var infiniteHelpers = require('./utils/infiniteHelpers');
var _isFinite = require('lodash.isfinite');

var checkProps = require('./utils/checkProps');

class Infinite extends React.Component<
  ReactInfiniteProvidedDefaultProps,
  ReactInfiniteProps,
  ReactInfiniteState
> {
  state: ReactInfiniteState;

  static propTypes = propTypes;

  static containerHeightScaleFactor(factor) {
    if (!_isFinite(factor)) {
      throw new Error('The scale factor must be a number.');
    }
    return {
      type: scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR,
      amount: factor
    };
  }

  static defaultProps = {
    handleScroll: () => {},

    useWindowAsScrollContainer: false,

    onInfiniteLoad: () => {},
    loadingSpinnerDelegate: <div />,

    displayBottomUpwards: false,

    isInfiniteLoading: false,
    timeScrollStateLastsForAfterUserScrolls: 150,

    className: '',

    styles: {}
  };

  constructor(props: ReactInfiniteProps) {
    super(props);
    const nextInternalState = this.recomputeInternalStateFromProps(props);

    this.computedProps = nextInternalState.computedProps;
    this.utils = nextInternalState.utils;
    this.shouldAttachToBottom = props.displayBottomUpwards;

    const state = nextInternalState.newState;
    state.scrollTimeout = undefined;
    state.isScrolling = false;

    this.state = state;
  }

  // Properties currently used but which may be
  // refactored away in the future.
  computedProps: ReactInfiniteComputedProps;

  utils: ScrollUtils;
  shouldAttachToBottom = false;
  preservedScrollState = 0;
  loadingSpinnerHeight = 0;

  // Refs
  scrollable: HTMLDivElement;
  topSpacer: HTMLDivElement;
  bottomSpacer: HTMLDivElement;
  smoothScrollingWrapper: HTMLDivElement;
  loadingSpinner: HTMLDivElement;

  generateComputedUtilityFunctions = (
    props: ReactInfiniteProps
  ): ScrollUtils => {
    if (props.useWindowAsScrollContainer) {
      return new WindowAsContainerScrollUtils(
        this.loadingSpinner,
        window,
        this.infiniteHandleScroll
      );
    } else {
      return new ScrollUtils(
        this.loadingSpinner,
        () => this.scrollable,
        this.infiniteHandleScroll
      );
    }
  };

  recomputeInternalStateFromProps = (
    props: ReactInfiniteProps
  ): {
    computedProps: ReactInfiniteComputedProps,
    utils: ScrollUtils,
    newState: ReactInfiniteState
  } => {
    checkProps(props);
    var computedProps = infiniteHelpers.generateComputedProps(props);
    var utils: ScrollUtils = this.generateComputedUtilityFunctions(props);

    var newState = {};

    newState.numberOfChildren = React.Children.count(computedProps.children);
    newState.infiniteComputer = infiniteHelpers.createInfiniteComputer(
      computedProps.elementHeight,
      computedProps.children
    );

    if (computedProps.isInfiniteLoading !== undefined) {
      newState.isInfiniteLoading = computedProps.isInfiniteLoading;
    }

    newState.preloadBatchSize = computedProps.preloadBatchSize;
    newState.preloadAdditionalHeight = computedProps.preloadAdditionalHeight;

    newState = Object.assign(
      newState,
      infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
        newState,
        utils.getScrollTop()
      )
    );

    return {
      computedProps,
      utils,
      newState
    };
  };

  componentWillReceiveProps(nextProps: ReactInfiniteProps) {
    var nextInternalState = this.recomputeInternalStateFromProps(nextProps);

    this.computedProps = nextInternalState.computedProps;
    this.utils = nextInternalState.utils;

    this.setState(nextInternalState.newState);
  }

  componentWillUpdate() {
    if (this.props.displayBottomUpwards) {
      this.preservedScrollState =
        this.utils.getScrollTop() - this.loadingSpinnerHeight;
    }
  }

  componentDidUpdate(
    prevProps: ReactInfiniteProps,
    prevState: ReactInfiniteState
  ) {
    this.loadingSpinnerHeight = this.utils.getLoadingSpinnerHeight();

    if (
      !prevProps.useWindowAsScrollContainer &&
      this.props.useWindowAsScrollContainer
    ) {
      this.utils.subscribeToScrollListener();
    }

    if (this.props.displayBottomUpwards) {
      var lowestScrollTop = this.getLowestPossibleScrollTop();
      if (
        this.shouldAttachToBottom &&
        this.utils.getScrollTop() < lowestScrollTop
      ) {
        this.utils.setScrollTop(lowestScrollTop);
      } else if (prevProps.isInfiniteLoading && !this.props.isInfiniteLoading) {
        this.utils.setScrollTop(
          this.state.infiniteComputer.getTotalScrollableHeight() -
            prevState.infiniteComputer.getTotalScrollableHeight() +
            this.preservedScrollState
        );
      }
    }

    const hasLoadedMoreChildren =
      this.state.numberOfChildren !== prevState.numberOfChildren;
    if (hasLoadedMoreChildren) {
      var newApertureState = infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
        this.state,
        this.utils.getScrollTop()
      );
      this.setState(newApertureState);
    }

    const isMissingVisibleRows =
      hasLoadedMoreChildren &&
      !this.hasAllVisibleItems() &&
      !this.state.isInfiniteLoading;
    if (isMissingVisibleRows) {
      this.onInfiniteLoad();
    }
  }

  componentDidMount() {
    this.utils.subscribeToScrollListener();

    if (!this.hasAllVisibleItems()) {
      this.onInfiniteLoad();
    }

    if (this.props.displayBottomUpwards) {
      var lowestScrollTop = this.getLowestPossibleScrollTop();
      if (
        this.shouldAttachToBottom &&
        this.utils.getScrollTop() < lowestScrollTop
      ) {
        this.utils.setScrollTop(lowestScrollTop);
      }
    }
  }

  componentWillUnmount() {
    this.utils.unsubscribeFromScrollListener();
  }

  infiniteHandleScroll = (e: SyntheticEvent) => {
    if (this.utils.scrollShouldBeIgnored(e)) {
      return;
    }
    this.computedProps.handleScroll(this.scrollable);
    this.handleScroll(this.utils.getScrollTop());
  };

  manageScrollTimeouts = () => {
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
  };

  getLowestPossibleScrollTop = (): number => {
    return (
      this.state.infiniteComputer.getTotalScrollableHeight() -
      this.computedProps.containerHeight
    );
  };

  hasAllVisibleItems = (): boolean => {
    return !(
      _isFinite(this.computedProps.infiniteLoadBeginEdgeOffset) &&
      this.state.infiniteComputer.getTotalScrollableHeight() <
        this.computedProps.containerHeight
    );
  };

  passedEdgeForInfiniteScroll = (scrollTop: number): boolean => {
    const edgeOffset = this.computedProps.infiniteLoadBeginEdgeOffset;
    if (typeof edgeOffset !== 'number') {
      return false;
    }

    if (this.computedProps.displayBottomUpwards) {
      return !this.shouldAttachToBottom && scrollTop < edgeOffset;
    } else {
      return (
        scrollTop >
        this.state.infiniteComputer.getTotalScrollableHeight() -
          this.computedProps.containerHeight -
          edgeOffset
      );
    }
  };

  onInfiniteLoad = () => {
    this.setState({ isInfiniteLoading: true });
    this.computedProps.onInfiniteLoad();
  };

  handleScroll = (scrollTop: number) => {
    this.shouldAttachToBottom =
      this.computedProps.displayBottomUpwards &&
      scrollTop >= this.getLowestPossibleScrollTop();

    this.manageScrollTimeouts();

    var newApertureState = infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(
      this.state,
      scrollTop
    );

    if (
      this.passedEdgeForInfiniteScroll(scrollTop) &&
      !this.state.isInfiniteLoading
    ) {
      this.setState(Object.assign({}, newApertureState));
      this.onInfiniteLoad();
    } else {
      this.setState(newApertureState);
    }
  };

  render() {
    var displayables;
    if (this.state.numberOfChildren > 1) {
      displayables = this.computedProps.children.slice(
        this.state.displayIndexStart,
        this.state.displayIndexEnd + 1
      );
    } else {
      displayables = this.computedProps.children;
    }

    var infiniteScrollStyles = {};
    if (this.state.isScrolling) {
      infiniteScrollStyles.pointerEvents = 'none';
    }

    var topSpacerHeight = this.state.infiniteComputer.getTopSpacerHeight(
        this.state.displayIndexStart
      ),
      bottomSpacerHeight = this.state.infiniteComputer.getBottomSpacerHeight(
        this.state.displayIndexEnd
      );

    // This asymmetry is due to a reluctance to use CSS to control
    // the bottom alignment
    if (this.computedProps.displayBottomUpwards) {
      var heightDifference =
        this.computedProps.containerHeight -
        this.state.infiniteComputer.getTotalScrollableHeight();
      if (heightDifference > 0) {
        topSpacerHeight = heightDifference - this.loadingSpinnerHeight;
      }
    }

    var loadingSpinner =
      this.computedProps.infiniteLoadBeginEdgeOffset === undefined
        ? null
        : <div
            ref={c => {
              this.loadingSpinner = c;
            }}
          >
            {this.state.isInfiniteLoading
              ? this.computedProps.loadingSpinnerDelegate
              : null}
          </div>;

    // topSpacer and bottomSpacer take up the amount of space that the
    // rendered elements would have taken up otherwise
    return (
      <div
        className={this.computedProps.className}
        ref={c => {
          this.scrollable = c;
        }}
        style={this.utils.buildScrollableStyle(
          this.computedProps.containerHeight,
          this.computedProps.styles.scrollableStyle
        )}
        onScroll={this.utils.nodeScrollListener}
      >
        <div
          ref={c => {
            this.smoothScrollingWrapper = c;
          }}
          style={infiniteScrollStyles}
        >
          <div
            ref={c => {
              this.topSpacer = c;
            }}
            style={infiniteHelpers.buildHeightStyle(topSpacerHeight)}
          />
          {this.computedProps.displayBottomUpwards && loadingSpinner}
          {displayables}
          {!this.computedProps.displayBottomUpwards && loadingSpinner}
          <div
            ref={c => {
              this.bottomSpacer = c;
            }}
            style={infiniteHelpers.buildHeightStyle(bottomSpacerHeight)}
          />
        </div>
      </div>
    );
  }
}

module.exports = Infinite;
global.Infinite = Infinite;
