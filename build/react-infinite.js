var React = global.React || require('react'),
    _isArray = require('lodash.isarray'),
    _isFinite = require('lodash.isfinite'),
    ConstantInfiniteComputer = require('./computers/constant_infinite_computer.js'),
    ArrayInfiniteComputer = require('./computers/array_infinite_computer.js');
var _assign = require('object-assign');

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
    useWindowAsScrollContainer: React.PropTypes.bool,

    className: React.PropTypes.string
  },

  getDefaultProps:function() {
    return {
      handleScroll: function()  {},
      loadingSpinnerDelegate: React.createElement("div", null),
      onInfiniteLoad: function()  {},
      isInfiniteLoading: false,
      timeScrollStateLastsForAfterUserScrolls: 150,
      useWindowAsScrollContainer: false,
      className: ''
    };
  },

  // automatic adjust to scroll direction
  // give spinner a ReactCSSTransitionGroup
  getInitialState:function() {
    this.computedProps = this.generateComputedProps(this.props);
    this.utils = this.generateComputedUtilityFunctions(this.props);

    var computer = this.createInfiniteComputer(this.computedProps.elementHeight, this.computedProps.children);

    var preloadBatchSize = this.computedProps.preloadBatchSize;
    var preloadAdditionalHeight = this.computedProps.preloadAdditionalHeight;

    return {
      infiniteComputer: computer,

      numberOfChildren: React.Children.count(this.computedProps.children),
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
      throw new Error('You must provide either a number or an array of numbers as the elementHeight prop.');
    }

    return computer;
  },

  generateComputedProps:function(props) {
    var computedProps = _assign({}, props);
    computedProps.containerHeight = props.useWindowAsScrollContainer
      ? window.innerHeight : props.containerHeight;
    computedProps.preloadBatchSize = typeof props.preloadBatchSize === 'number'
      ? props.preloadBatchSize : computedProps.containerHeight / 2;
    computedProps.preloadAdditionalHeight = typeof props.preloadAdditionalHeight === 'number'
      ? props.preloadAdditionalHeight : computedProps.containerHeight;
    return computedProps;
  },

  generateComputedUtilityFunctions:function(props) {
    var utilities = {};
    if (props.useWindowAsScrollContainer) {
      utilities.subscribeToScrollListener = function()  {
        window.onscroll = this.infiniteHandleScroll;
      }.bind(this);
      utilities.nodeScrollListener = function()  {};
      utilities.getScrollTop = function()  {return window.scrollY;};
      utilities.scrollShouldBeIgnored = function()  {return false;};
      utilities.buildScrollableStyle = function()  {return {};};
    } else {
      utilities.subscribeToScrollListener = function()  {};
      utilities.nodeScrollListener = this.infiniteHandleScroll;
      utilities.getScrollTop = function()  {return React.findDOMNode(this.refs.scrollable).scrollTop;}.bind(this);
      utilities.scrollShouldBeIgnored = function(event)  {return event.target !== React.findDOMNode(this.refs.scrollable);}.bind(this);
      utilities.buildScrollableStyle = function()  {
        return {
          height: this.computedProps.containerHeight,
          overflowX: 'hidden',
          overflowY: 'scroll'
        };
      }.bind(this);
    }
    return utilities;
  },

  componentWillReceiveProps:function(nextProps) {
    this.computedProps = this.generateComputedProps(nextProps);
    this.utils = this.generateComputedUtilityFunctions(nextProps);

    var newStateObject = {};

    // TODO: more efficient elementHeight change detection
    newStateObject.infiniteComputer = this.createInfiniteComputer(
                                        this.computedProps.elementHeight,
                                        this.computedProps.children
                                      );

    if (this.computedProps.isInfiniteLoading !== undefined) {
      newStateObject.isInfiniteLoading = this.computedProps.isInfiniteLoading;
    }

    newStateObject.preloadBatchSize = this.computedProps.preloadBatchSize;
    newStateObject.preloadAdditionalHeight = this.computedProps.preloadAdditionalHeight;

    this.setState(newStateObject, function()  {
      this.setStateFromScrollTop(this.utils.getScrollTop());
    }.bind(this));
  },

  componentDidUpdate:function(prevProps) {
    if (React.Children.count(this.computedProps.children) !== React.Children.count(prevProps.children)) {
      this.setStateFromScrollTop(this.utils.getScrollTop());
    }
  },

  componentWillMount:function() {
    if (_isArray(this.computedProps.elementHeight)) {
      if (React.Children.count(this.computedProps.children) !== this.computedProps.elementHeight.length) {
        throw new Error('There must be as many values provided in the elementHeight prop as there are children.');
      }
    }
  },

  componentDidMount:function() {
    this.utils.subscribeToScrollListener();
  },

  // Given the scrollTop of the container, computes the state the
  // component should be in. The goal is to abstract all of this
  // from any actual representation in the DOM.
  // The window is the block with any preloadAdditionalHeight
  // added to it.
  setStateFromScrollTop:function(scrollTop) {
    var blockNumber = this.state.preloadBatchSize === 0 ? 0 : Math.floor(scrollTop / this.state.preloadBatchSize),
        blockStart = this.state.preloadBatchSize * blockNumber,
        blockEnd = blockStart + this.state.preloadBatchSize,
        apertureTop = Math.max(0, blockStart - this.state.preloadAdditionalHeight),
        apertureBottom = Math.min(this.state.infiniteComputer.getTotalScrollableHeight(),
                        blockEnd + this.state.preloadAdditionalHeight);

    this.setState({
      displayIndexStart: this.state.infiniteComputer.getDisplayIndexStart(apertureTop),
      displayIndexEnd: this.state.infiniteComputer.getDisplayIndexEnd(apertureBottom)
    });
  },

  infiniteHandleScroll:function(e) {
    if (this.utils.scrollShouldBeIgnored(e)) {
      return;
    }
    this.computedProps.handleScroll(React.findDOMNode(this.refs.scrollable));
    this.handleScroll(this.utils.getScrollTop());
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
          });
        }, this.computedProps.timeScrollStateLastsForAfterUserScrolls);

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
          this.computedProps.containerHeight -
          this.computedProps.infiniteLoadBeginBottomOffset);
    if (infiniteScrollBottomLimit && !this.state.isInfiniteLoading) {
      this.setState({
        isInfiniteLoading: true
      });
      this.computedProps.onInfiniteLoad();
    }
  },

  // Helpers for React styles.
  buildScrollableStyle:function() {
    return {
      height: this.computedProps.containerHeight,
      overflowX: 'hidden',
      overflowY: 'scroll'
    };
  },

  buildHeightStyle:function(height) {
    return {
      width: '100%',
      height: Math.ceil(height)
    };
  },

  render:function() {
    var displayables = this.computedProps.children.slice(this.state.displayIndexStart,
                                                         this.state.displayIndexEnd + 1);

    var infiniteScrollStyles = {};
    if (this.state.isScrolling) {
      infiniteScrollStyles.pointerEvents = 'none';
    }

    var topSpacerHeight = this.state.infiniteComputer.getTopSpacerHeight(this.state.displayIndexStart),
        bottomSpacerHeight = this.state.infiniteComputer.getBottomSpacerHeight(this.state.displayIndexEnd);

    // topSpacer and bottomSpacer take up the amount of space that the
    // rendered elements would have taken up otherwise
    return React.createElement("div", {className: this.computedProps.className, 
                ref: "scrollable", 
                style: this.utils.buildScrollableStyle(), 
                onScroll: this.utils.nodeScrollListener}, 
      React.createElement("div", {ref: "smoothScrollingWrapper", style: infiniteScrollStyles}, 
        React.createElement("div", {ref: "topSpacer", 
             style: this.buildHeightStyle(topSpacerHeight)}), 
            displayables, 
        React.createElement("div", {ref: "bottomSpacer", 
             style: this.buildHeightStyle(bottomSpacerHeight)}), 
        React.createElement("div", {ref: "loadingSpinner"}, 
             this.state.isInfiniteLoading ? this.computedProps.loadingSpinnerDelegate : null
        )
      )
    );
  }
});

module.exports = Infinite;
global.Infinite = Infinite;
