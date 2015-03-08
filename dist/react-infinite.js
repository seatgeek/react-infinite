(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Infinite = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
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

    var nextPBS = nextProps.preloadBatchSize;
    newStateObject.preloadBatchSize = nextPBS ? nextPBS : nextProps.containerHeight / 2;

    var nextPAH = nextProps.preloadAdditionalHeight;
    newStateObject.preloadAdditionalHeight = nextPAH ? nextPAH : nextProps.containerHeight;

    this.setState(newStateObject, function()  {
      that.setStateFromScrollTop(that.getScrollTop());
    });
  },

  componentDidUpdate:function(prevProps, prevState) {
    if (React.Children.count(this.props.children) !== prevProps.children.length) {
      this.setStateFromScrollTop(this.getScrollTop());
    }
  },

  componentWillMount:function() {
    if (_isArray(this.props.elementHeight)) {
      if (this.props.children.length !== this.props.elementHeight.length) {
        throw new Error("There must be as many values provided in the elementHeight prop as there are children.")
      }
    }
  },

  componentDidMount:function() {
    var that = this;

    this.setState({
      scrollableHeight: this.refs.scrollable.getDOMNode().clientHeight,
      currentScrollTop: this.getScrollTop(),
      previousScrollTop: this.getScrollTop()
    });
  },

  getScrollTop:function() {
    return this.refs.scrollable.getDOMNode().scrollTop;
  },

  isScrollingDown:function() {
    return this.state.previousScrollTop < this.state.currentScrollTop;
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
      displayIndexEnd: this.state.infiniteComputer.getDisplayIndexEnd(windowBottom),
      currentScrollTop: scrollTop,
      previousScrollTop: this.state.currentScrollTop
    });
  },

  infiniteHandleScroll:function(e) {
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


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./computers/array_infinite_computer.js":5,"./computers/constant_infinite_computer.js":6,"lodash.isarray":2,"lodash.isfinite":3,"react":undefined}],2:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var arrayTag = '[object Array]',
    funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Used to match `RegExp` special characters.
 * See this [article on `RegExp` characters](http://www.regular-expressions.info/characters.html#special)
 * for more details.
 */
var reRegExpChars = /[.*+?^${}()|[\]\/\\]/g,
    reHasRegExpChars = RegExp(reRegExpChars.source);

/**
 * Converts `value` to a string if it is not one. An empty string is returned
 * for `null` or `undefined` values.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  if (typeof value == 'string') {
    return value;
  }
  return value == null ? '' : (value + '');
}

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return (value && typeof value == 'object') || false;
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/**
 * Used to resolve the `toStringTag` of values.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * for more details.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reNative = RegExp('^' +
  escapeRegExp(objToString)
  .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/* Native method references for those with the same name as other `lodash` methods. */
var nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray;

/**
 * Used as the maximum length of an array-like value.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength)
 * for more details.
 */
var MAX_SAFE_INTEGER = Math.pow(2, 53) - 1;

/**
 * Checks if `value` is a valid array-like length.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * (function() { return _.isArray(arguments); })();
 * // => false
 */
var isArray = nativeIsArray || function(value) {
  return (isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag) || false;
};

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (objToString.call(value) == funcTag) {
    return reNative.test(fnToString.call(value));
  }
  return (isObjectLike(value) && reHostCtor.test(value)) || false;
}

/**
 * Escapes the `RegExp` special characters "\", "^", "$", ".", "|", "?", "*",
 * "+", "(", ")", "[", "]", "{" and "}" in `string`.
 *
 * @static
 * @memberOf _
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escapeRegExp('[lodash](https://lodash.com/)');
 * // => '\[lodash\]\(https://lodash\.com/\)'
 */
function escapeRegExp(string) {
  string = baseToString(string);
  return (string && reHasRegExpChars.test(string))
    ? string.replace(reRegExpChars, '\\$&')
    : string;
}

module.exports = isArray;

},{}],3:[function(require,module,exports){
(function (global){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var isNative = require('lodash.isnative');

/* Native method references for those with the same name as other `lodash` methods. */
var nativeIsFinite = global.isFinite,
    nativeNumIsFinite = isNative(nativeNumIsFinite = Number.isFinite) && nativeNumIsFinite;

/**
 * Checks if `value` is a finite primitive number.
 *
 * **Note:** This method is based on ES `Number.isFinite`. See the
 * [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-number.isfinite)
 * for more details.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a finite number, else `false`.
 * @example
 *
 * _.isFinite(10);
 * // => true
 *
 * _.isFinite('10');
 * // => false
 *
 * _.isFinite(true);
 * // => false
 *
 * _.isFinite(Object(10));
 * // => false
 *
 * _.isFinite(Infinity);
 * // => false
 */
var isFinite = nativeNumIsFinite || function(value) {
  return typeof value == 'number' && nativeIsFinite(value);
};

module.exports = isFinite;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lodash.isnative":4}],4:[function(require,module,exports){
/**
 * lodash 3.0.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.7.0 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Used to match `RegExp` special characters.
 * See this [article on `RegExp` characters](http://www.regular-expressions.info/characters.html#special)
 * for more details.
 */
var reRegExpChars = /[.*+?^${}()|[\]\/\\]/g,
    reHasRegExpChars = RegExp(reRegExpChars.source);

/**
 * Converts `value` to a string if it is not one. An empty string is returned
 * for `null` or `undefined` values.
 *
 * @private
 * @param {*} value The value to process.
 * @returns {string} Returns the string.
 */
function baseToString(value) {
  if (typeof value == 'string') {
    return value;
  }
  return value == null ? '' : (value + '');
}

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return (value && typeof value == 'object') || false;
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/**
 * Used to resolve the `toStringTag` of values.
 * See the [ES spec](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * for more details.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reNative = RegExp('^' +
  escapeRegExp(objToString)
  .replace(/toString|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (objToString.call(value) == funcTag) {
    return reNative.test(fnToString.call(value));
  }
  return (isObjectLike(value) && reHostCtor.test(value)) || false;
}

/**
 * Escapes the `RegExp` special characters "\", "^", "$", ".", "|", "?", "*",
 * "+", "(", ")", "[", "]", "{" and "}" in `string`.
 *
 * @static
 * @memberOf _
 * @category String
 * @param {string} [string=''] The string to escape.
 * @returns {string} Returns the escaped string.
 * @example
 *
 * _.escapeRegExp('[lodash](https://lodash.com/)');
 * // => '\[lodash\]\(https://lodash\.com/\)'
 */
function escapeRegExp(string) {
  string = baseToString(string);
  return (string && reHasRegExpChars.test(string))
    ? string.replace(reRegExpChars, '\\$&')
    : string;
}

module.exports = isNative;

},{}],5:[function(require,module,exports){
var InfiniteComputer = require('./infinite_computer.js'),
    bs = require('../utils/binary_index_search.js');

for(var InfiniteComputer____Key in InfiniteComputer){if(InfiniteComputer.hasOwnProperty(InfiniteComputer____Key)){ArrayInfiniteComputer[InfiniteComputer____Key]=InfiniteComputer[InfiniteComputer____Key];}}var ____SuperProtoOfInfiniteComputer=InfiniteComputer===null?null:InfiniteComputer.prototype;ArrayInfiniteComputer.prototype=Object.create(____SuperProtoOfInfiniteComputer);ArrayInfiniteComputer.prototype.constructor=ArrayInfiniteComputer;ArrayInfiniteComputer.__superConstructor__=InfiniteComputer;
  function ArrayInfiniteComputer(heightData, numberOfChildren) {"use strict";
    InfiniteComputer.call(this,heightData, numberOfChildren);
    this.prefixHeightData = this.heightData.reduce(function(acc, next)  {
      if (acc.length === 0) {
        return [next];
      } else {
        acc.push(acc[acc.length - 1] + next);
        return acc;
      }
    }, []);
  }

  ArrayInfiniteComputer.prototype.getTotalScrollableHeight=function() {"use strict";
    var length = this.prefixHeightData.length;
    return length === 0 ? 0 : this.prefixHeightData[length - 1];
  };

  ArrayInfiniteComputer.prototype.getDisplayIndexStart=function(windowTop) {"use strict";
    return bs.binaryIndexSearch(this.prefixHeightData, windowTop, bs.opts.CLOSEST_HIGHER);
  };

  ArrayInfiniteComputer.prototype.getDisplayIndexEnd=function(windowBottom) {"use strict";
    return bs.binaryIndexSearch(this.prefixHeightData, windowBottom, bs.opts.CLOSEST_HIGHER) + 1;
  };

  ArrayInfiniteComputer.prototype.getTopSpacerHeight=function(displayIndexStart) {"use strict";
    var previous = displayIndexStart - 1;
    return previous < 0 ? 0 : this.prefixHeightData[previous];
  };

  ArrayInfiniteComputer.prototype.getBottomSpacerHeight=function(displayIndexEnd) {"use strict";
    var previous = displayIndexEnd - 1;
    if (displayIndexEnd === 0) {
      return this.getTotalScrollableHeight();
    } else if (displayIndexEnd >= this.prefixHeightData.length) {
      return 0;
    } else {
      return this.getTotalScrollableHeight() - this.prefixHeightData[previous];
    }
  };


module.exports = ArrayInfiniteComputer;


},{"../utils/binary_index_search.js":8,"./infinite_computer.js":7}],6:[function(require,module,exports){
var InfiniteComputer = require('./infinite_computer.js');

for(var InfiniteComputer____Key in InfiniteComputer){if(InfiniteComputer.hasOwnProperty(InfiniteComputer____Key)){ConstantInfiniteComputer[InfiniteComputer____Key]=InfiniteComputer[InfiniteComputer____Key];}}var ____SuperProtoOfInfiniteComputer=InfiniteComputer===null?null:InfiniteComputer.prototype;ConstantInfiniteComputer.prototype=Object.create(____SuperProtoOfInfiniteComputer);ConstantInfiniteComputer.prototype.constructor=ConstantInfiniteComputer;ConstantInfiniteComputer.__superConstructor__=InfiniteComputer;function ConstantInfiniteComputer(){"use strict";if(InfiniteComputer!==null){InfiniteComputer.apply(this,arguments);}}
  ConstantInfiniteComputer.prototype.getTotalScrollableHeight=function() {"use strict";
    return this.heightData * this.numberOfChildren;
  };

  ConstantInfiniteComputer.prototype.getDisplayIndexStart=function(windowTop) {"use strict";
    return Math.floor(windowTop / this.heightData);
  };

  ConstantInfiniteComputer.prototype.getDisplayIndexEnd=function(windowBottom) {"use strict";
    return Math.ceil(windowBottom / this.heightData);
  };

  ConstantInfiniteComputer.prototype.getTopSpacerHeight=function(displayIndexStart) {"use strict";
    return displayIndexStart * this.heightData;
  };

  ConstantInfiniteComputer.prototype.getBottomSpacerHeight=function(displayIndexEnd) {"use strict";
    return Math.max(0, (this.numberOfChildren - displayIndexEnd) * this.heightData);
  };


module.exports = ConstantInfiniteComputer;


},{"./infinite_computer.js":7}],7:[function(require,module,exports){
// An infinite computer must be able to do the following things:
//  1. getTotalScrollableHeight()
//  2. getDisplayIndexStart()
//  3. getDisplayIndexEnd()


  function InfiniteComputer(heightData, numberOfChildren) {"use strict";
    this.heightData = heightData;
    this.numberOfChildren = numberOfChildren;
  }

  InfiniteComputer.prototype.getTotalScrollableHeight=function() {"use strict";
    throw new Error("getTotalScrollableHeight not implemented.");
  };

  InfiniteComputer.prototype.getDisplayIndexStart=function(windowTop) {"use strict";
    throw new Error("getDisplayIndexStart not implemented.");
  };

  InfiniteComputer.prototype.getDisplayIndexEnd=function(windowBottom) {"use strict";
    throw new Error("getDisplayIndexEnd not implemented.");
  };

  // These are helper methods, and can be calculated from
  // the above details.
  InfiniteComputer.prototype.getTopSpacerHeight=function(displayIndexStart) {"use strict";
    throw new Error("getTopSpacerHeight not implemented.");
  };

  InfiniteComputer.prototype.getBottomSpacerHeight=function(displayIndexEnd) {"use strict";
    throw new Error("getBottomSpacerHeight not implemented.");
  };


module.exports = InfiniteComputer;


},{}],8:[function(require,module,exports){
var opts = {
  CLOSEST_LOWER: 1,
  CLOSEST_HIGHER: 2
}

var binaryIndexSearch = function(array, item, opt) {
  var index;

  var high = array.length - 1,
      low = 0,
      middle,
      middleItem;

  while(low <= high) {
    middle = low + Math.floor((high - low) / 2);
    middleItem = array[middle];

    if (middleItem === item) {
      return middle;
    } else if (middleItem < item) {
      low = middle + 1;
    } else if (middleItem > item) {
      high = middle - 1;
    }
  }

  if (opt === opts.CLOSEST_LOWER && low > 0) {
    index = low - 1;
  } else if (opt === opts.CLOSEST_HIGHER && high < array.length - 1) {
    index = high + 1;
  }

  return index;
};

module.exports = {
  binaryIndexSearch: binaryIndexSearch,
  opts: opts
}


},{}]},{},[1])(1)
});