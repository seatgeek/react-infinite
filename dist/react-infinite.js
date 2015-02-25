/**
 * @jsx React.DOM
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['react'], factory);
    } else if (typeof exports === 'object') {
        module.exports = factory(require('react'));
    } else {
        root.Infinite = factory(root.React);
    }
}(this, function (React) {
    var Infinite = React.createClass({displayName: 'Infinite',

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

        // elementHeight is the height of each element in the
        // array. This must be provided so that no measurements
        // of rendered elements are necessary.
        elementHeight: React.PropTypes.number.isRequired,
        // This is the total height of the visible window.
        containerHeight: React.PropTypes.number.isRequired,

        infiniteLoadBeginBottomOffset: React.PropTypes.number,
        onInfiniteLoad: React.PropTypes.func,
        loadingSpinnerDelegate: React.PropTypes.node,

        isInfiniteLoading: React.PropTypes.bool,
        timeScrollStateLastsForAfterUserScrolls: React.PropTypes.number,

        className: React.PropTypes.string
      },

      getDefaultProps: function() {
        return {
          handleScroll: function(){},
          loadingSpinnerDelegate: React.DOM.div(null),
          onInfiniteLoad: function(){},
          isInfiniteLoading: false,
          timeScrollStateLastsForAfterUserScrolls: 150
        };
      },

      // automatic adjust to scroll direction
      // give spinner a ReactCSSTransitionGroup
      getInitialState: function() {
        var preloadBatchSize = this.props.preloadBatchSize ?
                               this.props.preloadBatchSize :
                               this.props.containerHeight / 2,
            preloadAdditionalHeight = this.props.preloadAdditionalHeight ?
                                      this.props.preloadAdditionalHeight :
                                      this.props.containerHeight;

        var displayIndexEnd = Math.min(this.props.children.length,
                              Math.ceil((preloadBatchSize +
                                        preloadAdditionalHeight) /
                                        this.props.elementHeight));
        return {
          numberOfChildren: this.props.children.length,
          scrollableHeight: undefined,
          displayIndexStart: 0,
          displayIndexEnd: displayIndexEnd,

          isInfiniteLoading: false,

          currentScrollTop: undefined,
          previousScrollTop: undefined,

          preloadBatchSize: preloadBatchSize,
          preloadAdditionalHeight: preloadAdditionalHeight,

          scrollTimeout: undefined,
          isScrolling: false
        };
      },

      componentWillReceiveProps: function(nextProps) {
        var that = this,
            newStateObject = {};

        if (nextProps.isInfiniteLoading !== undefined) {
          newStateObject.isInfiniteLoading = nextProps.isInfiniteLoading;
        }

        var nextPBS = nextProps.preloadBatchSize;
        newStateObject.preloadBatchSize = nextPBS ? nextPBS : nextProps.containerHeight / 2;

        var nextPAH = nextProps.preloadAdditionalHeight;
        newStateObject.preloadAdditionalHeight = nextPAH ? nextPAH : nextProps.containerHeight;

        this.setState(newStateObject, function() {
          that.setStateFromScrollTop(that.getScrollTop());
        });
      },

      componentDidUpdate: function(prevProps, prevState) {
        if (this.props.children.length !== prevProps.children.length) {
          this.setStateFromScrollTop(this.getScrollTop());
        }
      },

      componentWillMount: function() {
        if (React.Children.count(this.props.children) === 1) {
          throw new Error("Infinite does not do anything with only one child.")
        }
      },

      componentDidMount: function() {
        var that = this;

        this.setState({
          scrollableHeight: this.refs.scrollable.getDOMNode().clientHeight,
          currentScrollTop: this.getScrollTop(),
          previousScrollTop: this.getScrollTop()
        });
      },

      computeTotalScrollableHeight: function() {
        return this.props.elementHeight * this.props.children.length;
      },

      getScrollTop: function() {
        return this.refs.scrollable.getDOMNode().scrollTop;
      },

      isScrollingDown: function() {
        return this.state.previousScrollTop < this.state.currentScrollTop;
      },

      // Given the scrollTop of the container, computes the state the
      // component should be in. The goal is to abstract all of this
      // from any actual representation in the DOM.
      setStateFromScrollTop: function(scrollTop) {
        var blockNumber = Math.floor(scrollTop / this.state.preloadBatchSize),
            blockStart = this.state.preloadBatchSize * blockNumber,
            blockEnd = blockStart + this.state.preloadBatchSize,
            windowTop = Math.max(0, blockStart - this.state.preloadAdditionalHeight),
            windowBottom = Math.min(this.computeTotalScrollableHeight(),
                            blockEnd + this.state.preloadAdditionalHeight);

        var displayIndexStart = Math.floor(windowTop / this.props.elementHeight),
            displayIndexEnd = Math.ceil(windowBottom / this.props.elementHeight);

        this.setState({
          displayIndexStart: displayIndexStart,
          displayIndexEnd: displayIndexEnd,
          currentScrollTop: scrollTop,
          previousScrollTop: this.state.currentScrollTop
        });
      },

      infiniteHandleScroll: function(e) {
        this.props.handleScroll(this.refs.scrollable.getDOMNode());
        this.handleScroll(e.target.scrollTop);
      },

      manageScrollTimeouts: function() {
        // Maintains a series of timeouts to set this.state.isScrolling
        // to be true when the element is scrolling.

        if (this.state.scrollTimeout) {
          clearTimeout(this.state.scrollTimeout);
        }

        var that = this,
            scrollTimeout = setTimeout(function() {
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

      handleScroll: function(scrollTop) {
        var that = this;
        this.manageScrollTimeouts();
        this.setStateFromScrollTop(scrollTop);
        var infiniteScrollBottomLimit = scrollTop >
            (this.computeTotalScrollableHeight() -
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
      buildScrollableStyle: function() {
        return {
          height: this.props.containerHeight,
          overflowX: 'hidden',
          overflowY: 'scroll'
        };
      },

      buildHeightStyle: function(height) {
        return {
          width: '100%',
          height: Math.ceil(height) + 'px'
        };
      },

      render: function() {
        var topHeight = this.state.displayIndexStart * this.props.elementHeight,
            bottomHeight = (this.props.children.length -
                             this.state.displayIndexEnd) *
                              this.props.elementHeight,
            that = this;

        var displayables = this.props.children.slice(this.state.displayIndexStart,
                                                     this.state.displayIndexEnd);

        var infiniteScrollStyles = {};
        if (this.state.isScrolling) {
          infiniteScrollStyles.pointerEvents = 'none';
        }

        // topSpacer and bottomSpacer take up the amount of space that the
        // rendered elements would have taken up otherwise
        return React.DOM.div({className: this.props.className ? this.props.className : '', 
                    ref: "scrollable", 
                    style: this.buildScrollableStyle(), 
                    onScroll: this.infiniteHandleScroll}, 
          React.DOM.div({ref: "smoothScrollingWrapper", style: infiniteScrollStyles}, 
            React.DOM.div({ref: "topSpacer", style: this.buildHeightStyle(topHeight)}), 
                displayables, 
            React.DOM.div({ref: "bottomSpacer", style: this.buildHeightStyle(bottomHeight)}), 
            React.DOM.div({ref: "loadingSpinner"}, 
                 this.state.isInfiniteLoading ? this.props.loadingSpinnerDelegate : null
            )
          )
        );
      }
    });

    return Infinite;
}));


