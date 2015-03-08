var React = global.React || require('react'),
    _isArray = require('lodash.isarray'),
    _isFinite = require('lodash.isfinite'),
    ConstantInfiniteComputer = require('./computers/constant_infinite_computer.js'),
    ArrayInfiniteComputer = require('./computers/array_infinite_computer.js');

var Infinite = React.createClass({

  propTypes: {
    handleScroll: React.PropTypes.func,

    // preloadBatchSize causes updates only to
    // happen each preloadBatchSize pixels of scrolling.
    // Set a larger number to cause fewer updates to the
    // element list.
    preloadBatchSize: React.PropTypes.number,
    // preloadAdditionalHeight determines how much of the
    // list above and below the container is preloaded even
    // when it is not currently visible to the user. In the
    // regular scroll implementation, preloadAdditionalHeight
    // is equal to the entire height of the list.
    preloadAdditionalHeight: React.PropTypes.number, // page to screen ratio

    // The provided elementHeight can be either
    //  1. a constant: all elements are the same height
    //  2. an array containing the height of each element
    elementHeight: React.PropTypes.oneOfType([
      React.PropTypes.number,
      React.PropTypes.arrayOf(React.PropTypes.number)
    ]).isRequired,
    // This is the total height of the visible window.
    containerHeight: React.PropTypes.number.isRequired,

    infiniteLoadBeginBottomOffset: React.PropTypes.number,
    onInfiniteLoad: React.PropTypes.func,
    loadingSpinnerDelegate: React.PropTypes.node,

    isInfiniteLoading: React.PropTypes.bool,
    timeScrollStateLastsForAfterUserScrolls: React.PropTypes.number,

    className: React.PropTypes.string
  },

  getDefaultProps() {
    return {
      handleScroll: () => {},
      loadingSpinnerDelegate: <div/>,
      onInfiniteLoad: () => {},
      isInfiniteLoading: false,
      timeScrollStateLastsForAfterUserScrolls: 150
    };
  },

  // automatic adjust to scroll direction
  // give spinner a ReactCSSTransitionGroup
  getInitialState() {
    var computer = this.createInfiniteComputer(this.props.elementHeight, this.props.children);

    var preloadBatchSize = this.props.preloadBatchSize ?
                           this.props.preloadBatchSize :
                           this.props.containerHeight / 2,
        preloadAdditionalHeight = this.props.preloadAdditionalHeight ?
                                  this.props.preloadAdditionalHeight :
                                  this.props.containerHeight;

    return {
      infiniteComputer: computer,

      numberOfChildren: this.props.children.length,
      scrollableHeight: undefined,
      displayIndexStart: 0,
      displayIndexEnd: computer.getDisplayIndexEnd(
                        preloadBatchSize + preloadAdditionalHeight
                      ),

      isInfiniteLoading: false,

      currentScrollTop: undefined,
      previousScrollTop: undefined,

      preloadBatchSize: preloadBatchSize,
      preloadAdditionalHeight: preloadAdditionalHeight,

      scrollTimeout: undefined,
      isScrolling: false
    };
  },

  createInfiniteComputer(data, children) {
    var computer;
    var numberOfChildren = React.Children.count(children);

    if (_isFinite(data)) {
      computer = new ConstantInfiniteComputer(data, numberOfChildren);
    } else if (_isArray(data)) {
      computer = new ArrayInfiniteComputer(data, numberOfChildren);
    } else {
      throw new Error("You must provide either a number or an array of numbers as the elementHeight prop.");
    }

    return computer;
  },

  componentWillReceiveProps(nextProps) {
    var that = this,
        newStateObject = {};

    // TODO: more efficient elementHeight change detection
    newStateObject.infiniteComputer = this.createInfiniteComputer(
                                        nextProps.elementHeight,
                                        nextProps.children
                                      );

    if (nextProps.isInfiniteLoading !== undefined) {
      newStateObject.isInfiniteLoading = nextProps.isInfiniteLoading;
    }

    var nextPBS = nextProps.preloadBatchSize;
    newStateObject.preloadBatchSize = nextPBS ? nextPBS : nextProps.containerHeight / 2;

    var nextPAH = nextProps.preloadAdditionalHeight;
    newStateObject.preloadAdditionalHeight = nextPAH ? nextPAH : nextProps.containerHeight;

    this.setState(newStateObject, () => {
      that.setStateFromScrollTop(that.getScrollTop());
    });
  },

  componentDidUpdate(prevProps, prevState) {
    if (React.Children.count(this.props.children) !== prevProps.children.length) {
      this.setStateFromScrollTop(this.getScrollTop());
    }
  },

  componentWillMount() {
    if (_isArray(this.props.elementHeight)) {
      if (this.props.children.length !== this.props.elementHeight.length) {
        throw new Error("There must be as many values provided in the elementHeight prop as there are children.")
      }
    }
  },

  componentDidMount() {
    var that = this;

    this.setState({
      scrollableHeight: this.refs.scrollable.getDOMNode().clientHeight,
      currentScrollTop: this.getScrollTop(),
      previousScrollTop: this.getScrollTop()
    });
  },

  getScrollTop() {
    return this.refs.scrollable.getDOMNode().scrollTop;
  },

  isScrollingDown() {
    return this.state.previousScrollTop < this.state.currentScrollTop;
  },

  // Given the scrollTop of the container, computes the state the
  // component should be in. The goal is to abstract all of this
  // from any actual representation in the DOM.
  // The window is the block with any preloadAdditionalHeight
  // added to it.
  setStateFromScrollTop(scrollTop) {
    var blockNumber = Math.floor(scrollTop / this.state.preloadBatchSize),
        blockStart = this.state.preloadBatchSize * blockNumber,
        blockEnd = blockStart + this.state.preloadBatchSize,
        windowTop = Math.max(0, blockStart - this.state.preloadAdditionalHeight),
        windowBottom = Math.min(this.state.infiniteComputer.getTotalScrollableHeight(),
                        blockEnd + this.state.preloadAdditionalHeight)
    this.setState({
      displayIndexStart: this.state.infiniteComputer.getDisplayIndexStart(windowTop),
      displayIndexEnd: this.state.infiniteComputer.getDisplayIndexEnd(windowBottom),
      currentScrollTop: scrollTop,
      previousScrollTop: this.state.currentScrollTop
    });
  },

  infiniteHandleScroll(e) {
    this.props.handleScroll(this.refs.scrollable.getDOMNode());
    this.handleScroll(e.target.scrollTop);
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
          })
        }, this.props.timeScrollStateLastsForAfterUserScrolls);

    this.setState({
      isScrolling: true,
      scrollTimeout: scrollTimeout
    });
  },

  handleScroll(scrollTop) {
    var that = this;
    this.manageScrollTimeouts();
    this.setStateFromScrollTop(scrollTop);
    var infiniteScrollBottomLimit = scrollTop >
        (this.state.infiniteComputer.getTotalScrollableHeight() -
          this.props.containerHeight -
          this.props.infiniteLoadBeginBottomOffset);
    if (infiniteScrollBottomLimit && !this.state.isInfiniteLoading) {
      this.setState({
        isInfiniteLoading: true
      });
      this.props.onInfiniteLoad();
    }
  },

  // Helpers for React styles.
  buildScrollableStyle() {
    return {
      height: this.props.containerHeight,
      overflowX: 'hidden',
      overflowY: 'scroll'
    };
  },

  buildHeightStyle(height) {
    return {
      width: '100%',
      height: Math.ceil(height) + 'px'
    };
  },

  render() {
    var that = this;
    var displayables = this.props.children.slice(this.state.displayIndexStart,
                                                 this.state.displayIndexEnd);

    var infiniteScrollStyles = {};
    if (this.state.isScrolling) {
      infiniteScrollStyles.pointerEvents = 'none';
    }

    var topSpacerHeight = this.state.infiniteComputer.getTopSpacerHeight(this.state.displayIndexStart),
        bottomSpacerHeight = this.state.infiniteComputer.getBottomSpacerHeight(this.state.displayIndexEnd);

    // topSpacer and bottomSpacer take up the amount of space that the
    // rendered elements would have taken up otherwise
    return <div className={this.props.className ? this.props.className : ''}
                ref="scrollable"
                style={this.buildScrollableStyle()}
                onScroll={this.infiniteHandleScroll}>
      <div ref="smoothScrollingWrapper" style={infiniteScrollStyles}>
        <div ref="topSpacer"
             style={this.buildHeightStyle(topSpacerHeight)}/>
            {displayables}
        <div ref="bottomSpacer"
             style={this.buildHeightStyle(bottomSpacerHeight)}/>
        <div ref="loadingSpinner">
             {this.state.isInfiniteLoading ? this.props.loadingSpinnerDelegate : null}
        </div>
      </div>
    </div>;
  }
});

module.exports = Infinite;
global.Infinite = Infinite;
