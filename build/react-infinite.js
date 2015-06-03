var React = global.React || require('react'),
    _isArray = require('lodash.isarray'),
    _isFinite = require('lodash.isfinite'),
    ConstantInfiniteComputer = require('./computers/constant_infinite_computer.js'),
    ArrayInfiniteComputer = require('./computers/array_infinite_computer.js');

var Infinite = React.createClass({displayName: "Infinite",

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

  getDefaultProps:function() {
    return {
      handleScroll: function()  {},
      loadingSpinnerDelegate: React.createElement("div", null),
      onInfiniteLoad: function()  {},
      isInfiniteLoading: false,
      timeScrollStateLastsForAfterUserScrolls: 150
    };
  },

  // automatic adjust to scroll direction
  // give spinner a ReactCSSTransitionGroup
  getInitialState:function() {
    var computer = this.createInfiniteComputer(this.props.elementHeight, this.props.children);

    var preloadBatchSize = this.getPreloadBatchSizeFromProps(this.props);
    var preloadAdditionalHeight = this.getPreloadAdditionalHeightFromProps(this.props);

    return {
      infiniteComputer: computer,

      numberOfChildren: React.Children.count(this.props.children),
      displayIndexStart: 0,
      displayIndexEnd: computer.getDisplayIndexEnd(
                        preloadBatchSize + preloadAdditionalHeight
                      ),

      isInfiniteLoading: false,

      preloadBatchSize: preloadBatchSize,
      preloadAdditionalHeight: preloadAdditionalHeight,

      scrollTimeout: undefined,
      isScrolling: false
    };
  },

  createInfiniteComputer:function(data, children) {
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

  componentWillReceiveProps:function(nextProps) {
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

    newStateObject.preloadBatchSize = this.getPreloadBatchSizeFromProps(nextProps);
    newStateObject.preloadAdditionalHeight = this.getPreloadAdditionalHeightFromProps(nextProps);

    this.setState(newStateObject, function()  {
      that.setStateFromScrollTop(that.getScrollTop());
    });
  },

  getPreloadBatchSizeFromProps:function(props) {
    return props.preloadBatchSize ?
      props.preloadBatchSize :
      props.containerHeight / 2;
  },

  getPreloadAdditionalHeightFromProps:function(props) {
    return props.preloadAdditionalHeight ?
      props.preloadAdditionalHeight :
      props.containerHeight;
  },

  componentDidUpdate:function(prevProps, prevState) {
    if (React.Children.count(this.props.children) !== React.Children.count(prevProps.children)) {
      this.setStateFromScrollTop(this.getScrollTop());
    }
  },

  componentWillMount:function() {
    if (_isArray(this.props.elementHeight)) {
      if (React.Children.count(this.props.children) !== this.props.elementHeight.length) {
        throw new Error("There must be as many values provided in the elementHeight prop as there are children.")
      }
    }
  },

  getScrollTop:function() {
    return this.refs.scrollable.getDOMNode().scrollTop;
  },

  // Given the scrollTop of the container, computes the state the
  // component should be in. The goal is to abstract all of this
  // from any actual representation in the DOM.
  // The window is the block with any preloadAdditionalHeight
  // added to it.
  setStateFromScrollTop:function(scrollTop) {
    var blockNumber = Math.floor(scrollTop / this.state.preloadBatchSize),
        blockStart = this.state.preloadBatchSize * blockNumber,
        blockEnd = blockStart + this.state.preloadBatchSize,
        windowTop = Math.max(0, blockStart - this.state.preloadAdditionalHeight),
        windowBottom = Math.min(this.state.infiniteComputer.getTotalScrollableHeight(),
                        blockEnd + this.state.preloadAdditionalHeight)
    this.setState({
      displayIndexStart: this.state.infiniteComputer.getDisplayIndexStart(windowTop),
      displayIndexEnd: this.state.infiniteComputer.getDisplayIndexEnd(windowBottom)
    });
  },

  infiniteHandleScroll:function(e) {
    if (e.target !== this.refs.scrollable.getDOMNode()) {
      return;
    }

    this.props.handleScroll(this.refs.scrollable.getDOMNode());
    this.handleScroll(e.target.scrollTop);
  },

  manageScrollTimeouts:function() {
    // Maintains a series of timeouts to set this.state.isScrolling
    // to be true when the element is scrolling.

    if (this.state.scrollTimeout) {
      clearTimeout(this.state.scrollTimeout);
    }

    var that = this,
        scrollTimeout = setTimeout(function()  {
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

  handleScroll:function(scrollTop) {
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
  buildScrollableStyle:function() {
    return {
      height: this.props.containerHeight,
      overflowX: 'hidden',
      overflowY: 'scroll'
    };
  },

  buildHeightStyle:function(height) {
    return {
      width: '100%',
      height: Math.ceil(height) + 'px'
    };
  },

  render:function() {
    var displayables = this.props.children.slice(this.state.displayIndexStart,
                                                 this.state.displayIndexEnd + 1);

    var infiniteScrollStyles = {};
    if (this.state.isScrolling) {
      infiniteScrollStyles.pointerEvents = 'none';
    }

    var topSpacerHeight = this.state.infiniteComputer.getTopSpacerHeight(this.state.displayIndexStart),
        bottomSpacerHeight = this.state.infiniteComputer.getBottomSpacerHeight(this.state.displayIndexEnd);

    // topSpacer and bottomSpacer take up the amount of space that the
    // rendered elements would have taken up otherwise
    return React.createElement("div", {className: this.props.className ? this.props.className : '', 
                ref: "scrollable", 
                style: this.buildScrollableStyle(), 
                onScroll: this.infiniteHandleScroll}, 
      React.createElement("div", {ref: "smoothScrollingWrapper", style: infiniteScrollStyles}, 
        React.createElement("div", {ref: "topSpacer", 
             style: this.buildHeightStyle(topSpacerHeight)}), 
            displayables, 
        React.createElement("div", {ref: "bottomSpacer", 
             style: this.buildHeightStyle(bottomSpacerHeight)}), 
        React.createElement("div", {ref: "loadingSpinner"}, 
             this.state.isInfiniteLoading ? this.props.loadingSpinnerDelegate : null
        )
      )
    );
  }
});

module.exports = Infinite;
global.Infinite = Infinite;
