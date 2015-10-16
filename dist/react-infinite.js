(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Infinite = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
'use strict';

var React = global.React || require('react');
var _assign = require('object-assign');
var checkProps = require('./utils/checkProps');
var infiniteHelpers = require('./utils/infiniteHelpers');

var Infinite = React.createClass({
  displayName: 'Infinite',

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
    elementHeight: React.PropTypes.oneOfType([React.PropTypes.number, React.PropTypes.arrayOf(React.PropTypes.number)]).isRequired,
    // This is the total height of the visible window. One
    // of
    containerHeight: React.PropTypes.number,
    useWindowAsScrollContainer: React.PropTypes.bool,

    infiniteLoadBeginBottomOffset: React.PropTypes.number,
    onInfiniteLoad: React.PropTypes.func,
    loadingSpinnerDelegate: React.PropTypes.node,

    isInfiniteLoading: React.PropTypes.bool,
    timeScrollStateLastsForAfterUserScrolls: React.PropTypes.number,

    className: React.PropTypes.string
  },

  getDefaultProps: function getDefaultProps() {
    return {
      handleScroll: function handleScroll() {},
      loadingSpinnerDelegate: React.createElement('div', null),
      onInfiniteLoad: function onInfiniteLoad() {},
      isInfiniteLoading: false,
      timeScrollStateLastsForAfterUserScrolls: 150,
      useWindowAsScrollContainer: false,
      className: ''
    };
  },

  // automatic adjust to scroll direction
  // give spinner a ReactCSSTransitionGroup
  getInitialState: function getInitialState() {
    var nextInternalState = this.recomputeInternalStateFromProps(this.props);

    this.computedProps = nextInternalState.computedProps;
    this.utils = nextInternalState.utils;

    var state = nextInternalState.newState;
    state.scrollTimeout = undefined;
    state.isScrolling = false;

    return state;
  },

  generateComputedProps: function generateComputedProps(props) {
    var computedProps = _assign({}, props);
    computedProps.containerHeight = props.useWindowAsScrollContainer ? window.innerHeight : props.containerHeight;
    computedProps.preloadBatchSize = typeof props.preloadBatchSize === 'number' ? props.preloadBatchSize : computedProps.containerHeight / 2;
    computedProps.preloadAdditionalHeight = typeof props.preloadAdditionalHeight === 'number' ? props.preloadAdditionalHeight : computedProps.containerHeight;
    return computedProps;
  },

  generateComputedUtilityFunctions: function generateComputedUtilityFunctions(props) {
    var _this = this;

    var utilities = {};
    if (props.useWindowAsScrollContainer) {
      utilities.subscribeToScrollListener = function () {
        window.addEventListener('scroll', _this.infiniteHandleScroll);
      };
      utilities.unsubscribeFromScrollListener = function () {
        window.removeEventListener('scroll');
      };
      utilities.nodeScrollListener = function () {};
      utilities.getScrollTop = function () {
        return window.scrollY;
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
        var scrollable;
        if (_this.refs.scrollable) {
          scrollable = React.findDOMNode(_this.refs.scrollable);
        }
        return scrollable ? scrollable.scrollTop : 0;
      };
      utilities.scrollShouldBeIgnored = function (event) {
        return event.target !== React.findDOMNode(_this.refs.scrollable);
      };
      utilities.buildScrollableStyle = function () {
        return {
          height: _this.computedProps.containerHeight,
          overflowX: 'hidden',
          overflowY: 'scroll',
          WebkitOverflowScrolling: 'touch'
        };
      };
    }
    return utilities;
  },

  recomputeInternalStateFromProps: function recomputeInternalStateFromProps(props) {
    checkProps(props);
    var computedProps = this.generateComputedProps(props);
    var utils = this.generateComputedUtilityFunctions(props);

    var newState = {
      numberOfChildren: React.Children.count(computedProps.children)
    };

    newState.infiniteComputer = infiniteHelpers.createInfiniteComputer(computedProps.elementHeight, computedProps.children);

    if (computedProps.isInfiniteLoading !== undefined) {
      newState.isInfiniteLoading = computedProps.isInfiniteLoading;
    }

    newState.preloadBatchSize = computedProps.preloadBatchSize;
    newState.preloadAdditionalHeight = computedProps.preloadAdditionalHeight;

    _assign(newState, infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(newState, utils.getScrollTop()));

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

  componentDidUpdate: function componentDidUpdate(prevProps, prevState) {
    if (React.Children.count(this.props.children) !== React.Children.count(prevProps.children)) {
      var newApertureState = infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(this.state, this.utils.getScrollTop());
      this.setState(newApertureState);
    }
  },

  componentDidMount: function componentDidMount() {
    this.utils.subscribeToScrollListener();
  },

  componentWillUnmount: function componentWillUnmount() {
    this.utils.unsubscribeFromScrollListener();
  },

  infiniteHandleScroll: function infiniteHandleScroll(e) {
    if (this.utils.scrollShouldBeIgnored(e)) {
      return;
    }
    this.computedProps.handleScroll(React.findDOMNode(this.refs.scrollable));
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

  handleScroll: function handleScroll(scrollTop) {
    this.manageScrollTimeouts();

    var newApertureState = infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(this.state, scrollTop);

    var infiniteScrollBottomLimit = scrollTop > this.state.infiniteComputer.getTotalScrollableHeight() - this.computedProps.containerHeight - this.computedProps.infiniteLoadBeginBottomOffset;
    if (infiniteScrollBottomLimit && !this.state.isInfiniteLoading) {
      this.setState(_assign(newApertureState, {
        isInfiniteLoading: true
      }));
      this.computedProps.onInfiniteLoad();
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
    var displayables;
    if (React.Children.count(this.computedProps.children) > 1) {
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

    // topSpacer and bottomSpacer take up the amount of space that the
    // rendered elements would have taken up otherwise
    return React.createElement(
      'div',
      { className: this.computedProps.className,
        ref: 'scrollable',
        style: this.utils.buildScrollableStyle(),
        onScroll: this.utils.nodeScrollListener },
      React.createElement(
        'div',
        { ref: 'smoothScrollingWrapper', style: infiniteScrollStyles },
        React.createElement('div', { ref: 'topSpacer',
          style: this.buildHeightStyle(topSpacerHeight) }),
        displayables,
        React.createElement('div', { ref: 'bottomSpacer',
          style: this.buildHeightStyle(bottomSpacerHeight) }),
        React.createElement(
          'div',
          { ref: 'loadingSpinner' },
          this.state.isInfiniteLoading ? this.computedProps.loadingSpinnerDelegate : null
        )
      )
    );
  }
});

module.exports = Infinite;
global.Infinite = Infinite;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./utils/checkProps":9,"./utils/infiniteHelpers":10,"object-assign":4,"react":undefined}],2:[function(require,module,exports){
/**
 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var arrayTag = '[object Array]',
    funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/* Native method references for those with the same name as other `lodash` methods. */
var nativeIsArray = getNative(Array, 'isArray');

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
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
 * _.isArray(function() { return arguments; }());
 * // => false
 */
var isArray = nativeIsArray || function(value) {
  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
};

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in older versions of Chrome and Safari which return 'function' for regexes
  // and Safari 8 equivalents which return 'object' for typed array constructors.
  return isObject(value) && objToString.call(value) == funcTag;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

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
  if (isFunction(value)) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = isArray;

},{}],3:[function(require,module,exports){
(function (global){
/**
 * lodash 3.2.0 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/* Native method references for those with the same name as other `lodash` methods. */
var nativeIsFinite = global.isFinite;

/**
 * Checks if `value` is a finite primitive number.
 *
 * **Note:** This method is based on [`Number.isFinite`](http://ecma-international.org/ecma-262/6.0/#sec-number.isfinite).
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
function isFinite(value) {
  return typeof value == 'number' && nativeIsFinite(value);
}

module.exports = isFinite;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],4:[function(require,module,exports){
/* eslint-disable no-unused-vars */
'use strict';
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

module.exports = Object.assign || function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (Object.getOwnPropertySymbols) {
			symbols = Object.getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],5:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InfiniteComputer = require('./infiniteComputer.js'),
    bs = require('../utils/binaryIndexSearch.js');

var ArrayInfiniteComputer = (function (_InfiniteComputer) {
  _inherits(ArrayInfiniteComputer, _InfiniteComputer);

  function ArrayInfiniteComputer(heightData, /* : Array<number> */numberOfChildren /* : number */) /* : void */{
    _classCallCheck(this, ArrayInfiniteComputer);

    _get(Object.getPrototypeOf(ArrayInfiniteComputer.prototype), 'constructor', this).call(this, heightData, numberOfChildren);
    this.prefixHeightData = this.heightData.reduce(function (acc, next) {
      if (acc.length === 0) {
        return [next];
      } else {
        acc.push(acc[acc.length - 1] + next);
        return acc;
      }
    }, []);
  }

  _createClass(ArrayInfiniteComputer, [{
    key: 'maybeIndexToIndex',
    value: function maybeIndexToIndex(index /* : ?number */) /* : number */{
      if (typeof index === 'undefined' || index === null) {
        return this.prefixHeightData.length - 1;
      } else {
        return index;
      }
    }
  }, {
    key: 'getTotalScrollableHeight',
    value: function getTotalScrollableHeight() /* : number */{
      var length = this.prefixHeightData.length;
      return length === 0 ? 0 : this.prefixHeightData[length - 1];
    }
  }, {
    key: 'getDisplayIndexStart',
    value: function getDisplayIndexStart(windowTop /* : number */) /* : number */{
      var foundIndex = bs.binaryIndexSearch(this.prefixHeightData, windowTop, bs.opts.CLOSEST_HIGHER);
      return this.maybeIndexToIndex(foundIndex);
    }
  }, {
    key: 'getDisplayIndexEnd',
    value: function getDisplayIndexEnd(windowBottom /* : number */) /* : number */{
      var foundIndex = bs.binaryIndexSearch(this.prefixHeightData, windowBottom, bs.opts.CLOSEST_HIGHER);
      return this.maybeIndexToIndex(foundIndex);
    }
  }, {
    key: 'getTopSpacerHeight',
    value: function getTopSpacerHeight(displayIndexStart /* : number */) /* : number */{
      var previous = displayIndexStart - 1;
      return previous < 0 ? 0 : this.prefixHeightData[previous];
    }
  }, {
    key: 'getBottomSpacerHeight',
    value: function getBottomSpacerHeight(displayIndexEnd /* : number */) /* : number */{
      if (displayIndexEnd === -1) {
        return 0;
      }
      return this.getTotalScrollableHeight() - this.prefixHeightData[displayIndexEnd];
    }
  }]);

  return ArrayInfiniteComputer;
})(InfiniteComputer);

module.exports = ArrayInfiniteComputer;

},{"../utils/binaryIndexSearch.js":8,"./infiniteComputer.js":7}],6:[function(require,module,exports){
'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InfiniteComputer = require('./infiniteComputer.js');

var ConstantInfiniteComputer = (function (_InfiniteComputer) {
  _inherits(ConstantInfiniteComputer, _InfiniteComputer);

  function ConstantInfiniteComputer() {
    _classCallCheck(this, ConstantInfiniteComputer);

    _get(Object.getPrototypeOf(ConstantInfiniteComputer.prototype), 'constructor', this).apply(this, arguments);
  }

  _createClass(ConstantInfiniteComputer, [{
    key: 'getTotalScrollableHeight',
    value: function getTotalScrollableHeight() /* : number */{
      return this.heightData * this.numberOfChildren;
    }
  }, {
    key: 'getDisplayIndexStart',
    value: function getDisplayIndexStart(windowTop /* : number */) /* : number */{
      return Math.floor(windowTop / this.heightData);
    }
  }, {
    key: 'getDisplayIndexEnd',
    value: function getDisplayIndexEnd(windowBottom /* : number */) /* : number */{
      var nonZeroIndex = Math.ceil(windowBottom / this.heightData);
      if (nonZeroIndex > 0) {
        return nonZeroIndex - 1;
      }
      return nonZeroIndex;
    }
  }, {
    key: 'getTopSpacerHeight',
    value: function getTopSpacerHeight(displayIndexStart /* : number */) /* : number */{
      return displayIndexStart * this.heightData;
    }
  }, {
    key: 'getBottomSpacerHeight',
    value: function getBottomSpacerHeight(displayIndexEnd /* : number */) /* : number */{
      var nonZeroIndex = displayIndexEnd + 1;
      return Math.max(0, (this.numberOfChildren - nonZeroIndex) * this.heightData);
    }
  }]);

  return ConstantInfiniteComputer;
})(InfiniteComputer);

module.exports = ConstantInfiniteComputer;

},{"./infiniteComputer.js":7}],7:[function(require,module,exports){
// An infinite computer must be able to do the following things:
//  1. getTotalScrollableHeight()
//  2. getDisplayIndexStart()
//  3. getDisplayIndexEnd()

'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var InfiniteComputer = (function () {
  function InfiniteComputer(heightData, numberOfChildren) {
    _classCallCheck(this, InfiniteComputer);

    this.heightData = heightData;
    this.numberOfChildren = numberOfChildren;
  }

  _createClass(InfiniteComputer, [{
    key: 'getTotalScrollableHeight',
    value: function getTotalScrollableHeight() {
      throw new Error('getTotalScrollableHeight not implemented.');
    }

    /* eslint-disable no-unused-vars */
  }, {
    key: 'getDisplayIndexStart',
    value: function getDisplayIndexStart(windowTop) {
      /* eslint-enable no-unused-vars */
      throw new Error('getDisplayIndexStart not implemented.');
    }

    /* eslint-disable no-unused-vars */
  }, {
    key: 'getDisplayIndexEnd',
    value: function getDisplayIndexEnd(windowBottom) {
      /* eslint-enable no-unused-vars */
      throw new Error('getDisplayIndexEnd not implemented.');
    }

    // These are helper methods, and can be calculated from
    // the above details.
    /* eslint-disable no-unused-vars */
  }, {
    key: 'getTopSpacerHeight',
    value: function getTopSpacerHeight(displayIndexStart) {
      /* eslint-enable no-unused-vars */
      throw new Error('getTopSpacerHeight not implemented.');
    }

    /* eslint-disable no-unused-vars */
  }, {
    key: 'getBottomSpacerHeight',
    value: function getBottomSpacerHeight(displayIndexEnd) {
      /* eslint-enable no-unused-vars */
      throw new Error('getBottomSpacerHeight not implemented.');
    }
  }]);

  return InfiniteComputer;
})();

module.exports = InfiniteComputer;

},{}],8:[function(require,module,exports){
"use strict";

var opts = {
  CLOSEST_LOWER: 1,
  CLOSEST_HIGHER: 2
};

var binaryIndexSearch = function binaryIndexSearch(array, /* : Array<number> */
item, /* : number */
opt /* : number */) /* : ?number */{
  var index;

  var high = array.length - 1,
      low = 0,
      middle,
      middleItem;

  while (low <= high) {
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
};

},{}],9:[function(require,module,exports){
(function (global){
// This module provides a centralized place for
// runtime checking that the props passed to React Infinite
// make the minimum amount of sense.

'use strict';

var React = global.React || require('react');
var _isArray = require('lodash.isarray');
var _isFinite = require('lodash.isfinite');

module.exports = function (props) {
  var rie = 'Invariant Violation: ';
  if (!(props.containerHeight || props.useWindowAsScrollContainer)) {
    throw new Error(rie + 'Either containerHeight or useWindowAsScrollContainer must be provided.');
  }

  if (!(_isFinite(props.elementHeight) || _isArray(props.elementHeight))) {
    throw new Error(rie + 'You must provide either a number or an array of numbers as the elementHeight.');
  }

  if (_isArray(props.elementHeight)) {
    if (React.Children.count(props.children) !== props.elementHeight.length) {
      throw new Error(rie + 'There must be as many values provided in the elementHeight prop as there are children.');
    }
  }
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lodash.isarray":2,"lodash.isfinite":3,"react":undefined}],10:[function(require,module,exports){
(function (global){
'use strict';

var _isArray = require('lodash.isarray');
var _isFinite = require('lodash.isfinite');
var ConstantInfiniteComputer = require('../computers/constantInfiniteComputer.js');
var ArrayInfiniteComputer = require('../computers/arrayInfiniteComputer.js');
var React = global.React || require('react');

function createInfiniteComputer(data, children) {
  var computer;
  var numberOfChildren = React.Children.count(children);

  // This should be guaranteed by checkProps
  if (_isFinite(data)) {
    computer = new ConstantInfiniteComputer(data, numberOfChildren);
  } else if (_isArray(data)) {
    computer = new ArrayInfiniteComputer(data, numberOfChildren);
  }

  return computer;
}

// Given the scrollTop of the container, computes the state the
// component should be in. The goal is to abstract all of this
// from any actual representation in the DOM.
// The window is the block with any preloadAdditionalHeight
// added to it.
function recomputeApertureStateFromOptionsAndScrollTop(_ref, scrollTop) {
  var preloadBatchSize = _ref.preloadBatchSize;
  var preloadAdditionalHeight = _ref.preloadAdditionalHeight;
  var infiniteComputer = _ref.infiniteComputer;

  var blockNumber = preloadBatchSize === 0 ? 0 : Math.floor(scrollTop / preloadBatchSize),
      blockStart = preloadBatchSize * blockNumber,
      blockEnd = blockStart + preloadBatchSize,
      apertureTop = Math.max(0, blockStart - preloadAdditionalHeight),
      apertureBottom = Math.min(infiniteComputer.getTotalScrollableHeight(), blockEnd + preloadAdditionalHeight);

  return {
    displayIndexStart: infiniteComputer.getDisplayIndexStart(apertureTop),
    displayIndexEnd: infiniteComputer.getDisplayIndexEnd(apertureBottom)
  };
}

module.exports = {
  createInfiniteComputer: createInfiniteComputer,
  recomputeApertureStateFromOptionsAndScrollTop: recomputeApertureStateFromOptionsAndScrollTop
};

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../computers/arrayInfiniteComputer.js":5,"../computers/constantInfiniteComputer.js":6,"lodash.isarray":2,"lodash.isfinite":3,"react":undefined}]},{},[1])(1)
});