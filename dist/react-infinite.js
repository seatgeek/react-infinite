(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Infinite = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (global){
"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var _createClass=function(){function e(e,t){for(var i=0;i<t.length;i++){var o=t[i];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),Object.defineProperty(e,o.key,o)}}return function(t,i,o){return i&&e(t.prototype,i),o&&e(t,o),t}}(),React=global.React||require("react"),PropTypes=global.PropTypes||require("prop-types"),window=require("./utils/window");require("./utils/establish-polyfills");var scaleEnum=require("./utils/scaleEnum"),infiniteHelpers=require("./utils/infiniteHelpers"),_isFinite=require("lodash.isfinite"),checkProps=require("./utils/checkProps"),Infinite=function(e){function t(e){_classCallCheck(this,t);var i=_possibleConstructorReturn(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e));_initialiseProps.call(i);var o=i.recomputeInternalStateFromProps(e);i.computedProps=o.computedProps,i.utils=o.utils,i.shouldAttachToBottom=e.displayBottomUpwards;var n=o.newState;return n.scrollTimeout=void 0,n.isScrolling=!1,i.state=n,i}return _inherits(t,e),_createClass(t,null,[{key:"containerHeightScaleFactor",value:function(e){if(!_isFinite(e))throw new Error("The scale factor must be a number.");return{type:scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR,amount:e}}}]),_createClass(t,[{key:"componentWillReceiveProps",value:function(e){var t=this.recomputeInternalStateFromProps(e);this.computedProps=t.computedProps,this.utils=t.utils,this.setState(t.newState)}},{key:"componentWillUpdate",value:function(){this.props.displayBottomUpwards&&(this.preservedScrollState=this.utils.getScrollTop()-this.loadingSpinnerHeight)}},{key:"componentDidUpdate",value:function(e,t){if(this.loadingSpinnerHeight=this.utils.getLoadingSpinnerHeight(),!e.useWindowAsScrollContainer&&this.props.useWindowAsScrollContainer&&this.utils.subscribeToScrollListener(),this.props.displayBottomUpwards){var i=this.getLowestPossibleScrollTop();this.shouldAttachToBottom&&this.utils.getScrollTop()<i?this.utils.setScrollTop(i):e.isInfiniteLoading&&!this.props.isInfiniteLoading&&this.utils.setScrollTop(this.state.infiniteComputer.getTotalScrollableHeight()-t.infiniteComputer.getTotalScrollableHeight()+this.preservedScrollState)}var o=this.state.numberOfChildren!==t.numberOfChildren;if(o){var n=infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(this.state,this.utils.getScrollTop());this.setState(n)}o&&!this.hasAllVisibleItems()&&!this.state.isInfiniteLoading&&this.onInfiniteLoad()}},{key:"componentDidMount",value:function(){if(this.utils.subscribeToScrollListener(),this.hasAllVisibleItems()||this.onInfiniteLoad(),this.props.displayBottomUpwards){var e=this.getLowestPossibleScrollTop();this.shouldAttachToBottom&&this.utils.getScrollTop()<e&&this.utils.setScrollTop(e)}}},{key:"componentWillUnmount",value:function(){this.utils.unsubscribeFromScrollListener()}},{key:"render",value:function(){var e,t=this;e=this.state.numberOfChildren>1?this.computedProps.children.slice(this.state.displayIndexStart,this.state.displayIndexEnd+1):this.computedProps.children;var i={};this.state.isScrolling&&(i.pointerEvents="none");var o=this.state.infiniteComputer.getTopSpacerHeight(this.state.displayIndexStart),n=this.state.infiniteComputer.getBottomSpacerHeight(this.state.displayIndexEnd);if(this.computedProps.displayBottomUpwards){var r=this.computedProps.containerHeight-this.state.infiniteComputer.getTotalScrollableHeight();r>0&&(o=r-this.loadingSpinnerHeight)}var s=void 0===this.computedProps.infiniteLoadBeginEdgeOffset?null:React.createElement("div",{ref:function(e){t.loadingSpinner=e}},this.state.isInfiniteLoading?this.computedProps.loadingSpinnerDelegate:null);return React.createElement("div",{className:this.computedProps.className,ref:function(e){t.scrollable=e},style:this.utils.buildScrollableStyle(),onScroll:this.utils.nodeScrollListener},React.createElement("div",{ref:function(e){t.smoothScrollingWrapper=e},style:i},React.createElement("div",{ref:function(e){t.topSpacer=e},style:infiniteHelpers.buildHeightStyle(o)}),this.computedProps.displayBottomUpwards&&s,e,!this.computedProps.displayBottomUpwards&&s,React.createElement("div",{ref:function(e){t.bottomSpacer=e},style:infiniteHelpers.buildHeightStyle(n)})))}}]),t}(React.Component);Infinite.propTypes={children:PropTypes.any,handleScroll:PropTypes.func,preloadBatchSize:PropTypes.oneOfType([PropTypes.number,PropTypes.shape({type:PropTypes.oneOf(["containerHeightScaleFactor"]).isRequired,amount:PropTypes.number.isRequired})]),preloadAdditionalHeight:PropTypes.oneOfType([PropTypes.number,PropTypes.shape({type:PropTypes.oneOf(["containerHeightScaleFactor"]).isRequired,amount:PropTypes.number.isRequired})]),elementHeight:PropTypes.oneOfType([PropTypes.number,PropTypes.arrayOf(PropTypes.number)]).isRequired,containerHeight:PropTypes.number,useWindowAsScrollContainer:PropTypes.bool,displayBottomUpwards:PropTypes.bool.isRequired,infiniteLoadBeginEdgeOffset:PropTypes.number,onInfiniteLoad:PropTypes.func,loadingSpinnerDelegate:PropTypes.node,isInfiniteLoading:PropTypes.bool,timeScrollStateLastsForAfterUserScrolls:PropTypes.number,className:PropTypes.string,styles:PropTypes.shape({scrollableStyle:PropTypes.object}).isRequired},Infinite.defaultProps={handleScroll:function(){},useWindowAsScrollContainer:!1,onInfiniteLoad:function(){},loadingSpinnerDelegate:React.createElement("div",null),displayBottomUpwards:!1,isInfiniteLoading:!1,timeScrollStateLastsForAfterUserScrolls:150,className:"",styles:{}};var _initialiseProps=function(){var e=this;this.shouldAttachToBottom=!1,this.preservedScrollState=0,this.loadingSpinnerHeight=0,this.generateComputedUtilityFunctions=function(t){var i={};return i.getLoadingSpinnerHeight=function(){var t=0;return e.loadingSpinner&&(t=e.loadingSpinner.offsetHeight||0),t},t.useWindowAsScrollContainer?(i.subscribeToScrollListener=function(){window.addEventListener("scroll",e.infiniteHandleScroll)},i.unsubscribeFromScrollListener=function(){window.removeEventListener("scroll",e.infiniteHandleScroll)},i.nodeScrollListener=function(){},i.getScrollTop=function(){return window.pageYOffset},i.setScrollTop=function(e){window.scroll(window.pageXOffset,e)},i.scrollShouldBeIgnored=function(){return!1},i.buildScrollableStyle=function(){return{}}):(i.subscribeToScrollListener=function(){},i.unsubscribeFromScrollListener=function(){},i.nodeScrollListener=e.infiniteHandleScroll,i.getScrollTop=function(){return e.scrollable?e.scrollable.scrollTop:0},i.setScrollTop=function(t){e.scrollable&&(e.scrollable.scrollTop=t)},i.scrollShouldBeIgnored=function(t){return t.target!==e.scrollable},i.buildScrollableStyle=function(){return Object.assign({},{height:e.computedProps.containerHeight,overflowX:"hidden",overflowY:"scroll",WebkitOverflowScrolling:"touch"},e.computedProps.styles.scrollableStyle||{})}),i},this.recomputeInternalStateFromProps=function(t){checkProps(t);var i=infiniteHelpers.generateComputedProps(t),o=e.generateComputedUtilityFunctions(t),n={};return n.numberOfChildren=React.Children.count(i.children),n.infiniteComputer=infiniteHelpers.createInfiniteComputer(i.elementHeight,i.children),void 0!==i.isInfiniteLoading&&(n.isInfiniteLoading=i.isInfiniteLoading),n.preloadBatchSize=i.preloadBatchSize,n.preloadAdditionalHeight=i.preloadAdditionalHeight,n=Object.assign(n,infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(n,o.getScrollTop())),{computedProps:i,utils:o,newState:n}},this.infiniteHandleScroll=function(t){e.utils.scrollShouldBeIgnored(t)||(e.computedProps.handleScroll(e.scrollable),e.handleScroll(e.utils.getScrollTop()))},this.manageScrollTimeouts=function(){e.state.scrollTimeout&&clearTimeout(e.state.scrollTimeout);var t=e,i=setTimeout(function(){t.setState({isScrolling:!1,scrollTimeout:void 0})},e.computedProps.timeScrollStateLastsForAfterUserScrolls);e.setState({isScrolling:!0,scrollTimeout:i})},this.getLowestPossibleScrollTop=function(){return e.state.infiniteComputer.getTotalScrollableHeight()-e.computedProps.containerHeight},this.hasAllVisibleItems=function(){return!(_isFinite(e.computedProps.infiniteLoadBeginEdgeOffset)&&e.state.infiniteComputer.getTotalScrollableHeight()<e.computedProps.containerHeight)},this.passedEdgeForInfiniteScroll=function(t){var i=e.computedProps.infiniteLoadBeginEdgeOffset;return"number"==typeof i&&(e.computedProps.displayBottomUpwards?!e.shouldAttachToBottom&&t<i:t>e.state.infiniteComputer.getTotalScrollableHeight()-e.computedProps.containerHeight-i)},this.onInfiniteLoad=function(){e.setState({isInfiniteLoading:!0}),e.computedProps.onInfiniteLoad()},this.handleScroll=function(t){e.shouldAttachToBottom=e.computedProps.displayBottomUpwards&&t>=e.getLowestPossibleScrollTop(),e.manageScrollTimeouts();var i=infiniteHelpers.recomputeApertureStateFromOptionsAndScrollTop(e.state,t);e.passedEdgeForInfiniteScroll(t)&&!e.state.isInfiniteLoading?(e.setState(Object.assign({},i)),e.onInfiniteLoad()):e.setState(i)}};module.exports=Infinite,global.Infinite=Infinite;
}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./utils/checkProps":9,"./utils/establish-polyfills":10,"./utils/infiniteHelpers":11,"./utils/scaleEnum":12,"./utils/window":13,"lodash.isfinite":3,"prop-types":undefined,"react":undefined}],2:[function(require,module,exports){
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
"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(e,t){if(!e)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!t||"object"!=typeof t&&"function"!=typeof t?e:t}function _inherits(e,t){if("function"!=typeof t&&null!==t)throw new TypeError("Super expression must either be null or a function, not "+typeof t);e.prototype=Object.create(t&&t.prototype,{constructor:{value:e,enumerable:!1,writable:!0,configurable:!0}}),t&&(Object.setPrototypeOf?Object.setPrototypeOf(e,t):e.__proto__=t)}var _createClass=function(){function e(e,t){for(var r=0;r<t.length;r++){var n=t[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(e,n.key,n)}}return function(t,r,n){return r&&e(t.prototype,r),n&&e(t,n),t}}(),InfiniteComputer=require("./infiniteComputer.js"),bs=require("../utils/binaryIndexSearch.js"),ArrayInfiniteComputer=function(e){function t(e,r){_classCallCheck(this,t);var n=_possibleConstructorReturn(this,(t.__proto__||Object.getPrototypeOf(t)).call(this,e,r));return n.prefixHeightData=n.heightData.reduce(function(e,t){return 0===e.length?[t]:(e.push(e[e.length-1]+t),e)},[]),n}return _inherits(t,e),_createClass(t,[{key:"maybeIndexToIndex",value:function(e){return void 0===e||null===e?this.prefixHeightData.length-1:e}},{key:"getTotalScrollableHeight",value:function(){var e=this.prefixHeightData.length;return 0===e?0:this.prefixHeightData[e-1]}},{key:"getDisplayIndexStart",value:function(e){var t=bs.binaryIndexSearch(this.prefixHeightData,e,bs.opts.CLOSEST_HIGHER);return this.maybeIndexToIndex(t)}},{key:"getDisplayIndexEnd",value:function(e){var t=bs.binaryIndexSearch(this.prefixHeightData,e,bs.opts.CLOSEST_HIGHER);return this.maybeIndexToIndex(t)}},{key:"getTopSpacerHeight",value:function(e){var t=e-1;return t<0?0:this.prefixHeightData[t]}},{key:"getBottomSpacerHeight",value:function(e){return-1===e?0:this.getTotalScrollableHeight()-this.prefixHeightData[e]}}]),t}(InfiniteComputer);module.exports=ArrayInfiniteComputer;


},{"../utils/binaryIndexSearch.js":8,"./infiniteComputer.js":7}],6:[function(require,module,exports){
"use strict";function _classCallCheck(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function _possibleConstructorReturn(t,e){if(!t)throw new ReferenceError("this hasn't been initialised - super() hasn't been called");return!e||"object"!=typeof e&&"function"!=typeof e?t:e}function _inherits(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Super expression must either be null or a function, not "+typeof e);t.prototype=Object.create(e&&e.prototype,{constructor:{value:t,enumerable:!1,writable:!0,configurable:!0}}),e&&(Object.setPrototypeOf?Object.setPrototypeOf(t,e):t.__proto__=e)}var _createClass=function(){function t(t,e){for(var n=0;n<e.length;n++){var r=e[n];r.enumerable=r.enumerable||!1,r.configurable=!0,"value"in r&&(r.writable=!0),Object.defineProperty(t,r.key,r)}}return function(e,n,r){return n&&t(e.prototype,n),r&&t(e,r),e}}(),InfiniteComputer=require("./infiniteComputer.js"),ConstantInfiniteComputer=function(t){function e(){return _classCallCheck(this,e),_possibleConstructorReturn(this,(e.__proto__||Object.getPrototypeOf(e)).apply(this,arguments))}return _inherits(e,t),_createClass(e,[{key:"getTotalScrollableHeight",value:function(){return this.heightData*this.numberOfChildren}},{key:"getDisplayIndexStart",value:function(t){return Math.floor(t/this.heightData)}},{key:"getDisplayIndexEnd",value:function(t){var e=Math.ceil(t/this.heightData);return e>0?e-1:e}},{key:"getTopSpacerHeight",value:function(t){return t*this.heightData}},{key:"getBottomSpacerHeight",value:function(t){var e=t+1;return Math.max(0,(this.numberOfChildren-e)*this.heightData)}}]),e}(InfiniteComputer);module.exports=ConstantInfiniteComputer;


},{"./infiniteComputer.js":7}],7:[function(require,module,exports){
"use strict";function _classCallCheck(e,t){if(!(e instanceof t))throw new TypeError("Cannot call a class as a function")}var _createClass=function(){function e(e,t){for(var n=0;n<t.length;n++){var a=t[n];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}return function(t,n,a){return n&&e(t.prototype,n),a&&e(t,a),t}}(),InfiniteComputer=function(){function e(t,n){_classCallCheck(this,e),this.heightData=t,this.numberOfChildren=n}return _createClass(e,[{key:"getTotalScrollableHeight",value:function(){}},{key:"getDisplayIndexStart",value:function(e){}},{key:"getDisplayIndexEnd",value:function(e){}},{key:"getTopSpacerHeight",value:function(e){}},{key:"getBottomSpacerHeight",value:function(e){}}]),e}();module.exports=InfiniteComputer;


},{}],8:[function(require,module,exports){
"use strict";var opts={CLOSEST_LOWER:1,CLOSEST_HIGHER:2},binaryIndexSearch=function(r,t,e){for(var n,o,S,a=r.length-1,s=0;s<=a;){if(o=s+Math.floor((a-s)/2),(S=r[o])===t)return o;S<t?s=o+1:S>t&&(a=o-1)}return e===opts.CLOSEST_LOWER&&s>0?n=s-1:e===opts.CLOSEST_HIGHER&&a<r.length-1&&(n=a+1),n};module.exports={binaryIndexSearch:binaryIndexSearch,opts:opts};


},{}],9:[function(require,module,exports){
(function (global){
"use strict";var React=global.React||require("react"),_isFinite=require("lodash.isfinite");module.exports=function(e){var r="Invariant Violation: ";if(!e.containerHeight&&!e.useWindowAsScrollContainer)throw new Error(r+"Either containerHeight or useWindowAsScrollContainer must be provided.");if(!_isFinite(e.elementHeight)&&!Array.isArray(e.elementHeight))throw new Error(r+"You must provide either a number or an array of numbers as the elementHeight.");if(Array.isArray(e.elementHeight)&&React.Children.count(e.children)!==e.elementHeight.length)throw new Error(r+"There must be as many values provided in the elementHeight prop as there are children.")};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"lodash.isfinite":3,"react":undefined}],10:[function(require,module,exports){
"use strict";Object.assign||(Object.assign=require("object-assign")),Array.isArray||(Array.isArray=require("lodash.isarray"));


},{"lodash.isarray":2,"object-assign":4}],11:[function(require,module,exports){
(function (global){
"use strict";function _objectWithoutProperties(e,t){var o={};for(var n in e)t.indexOf(n)>=0||Object.prototype.hasOwnProperty.call(e,n)&&(o[n]=e[n]);return o}function createInfiniteComputer(e,t){var o=React.Children.count(t);return Array.isArray(e)?new ArrayInfiniteComputer(e,o):new ConstantInfiniteComputer(e,o)}function recomputeApertureStateFromOptionsAndScrollTop(e,t){var o=e.preloadBatchSize,n=e.preloadAdditionalHeight,r=e.infiniteComputer,i=0===o?0:Math.floor(t/o),a=o*i,p=a+o,l=Math.max(0,a-n),u=Math.min(r.getTotalScrollableHeight(),p+n);return{displayIndexStart:r.getDisplayIndexStart(l),displayIndexEnd:r.getDisplayIndexEnd(u)}}function generateComputedProps(e){var t=e.containerHeight,o=e.preloadBatchSize,n=e.preloadAdditionalHeight,r=e.handleScroll,i=e.onInfiniteLoad,a=_objectWithoutProperties(e,["containerHeight","preloadBatchSize","preloadAdditionalHeight","handleScroll","onInfiniteLoad"]),p={};t="number"==typeof t?t:0,p.containerHeight=e.useWindowAsScrollContainer?window.innerHeight:t,p.handleScroll=r||function(){},p.onInfiniteLoad=i||function(){};var l={type:scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR,amount:.5},u=o&&o.type?o:l;"number"==typeof o?p.preloadBatchSize=o:"object"===(void 0===u?"undefined":_typeof(u))&&u.type===scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR?p.preloadBatchSize=p.containerHeight*u.amount:p.preloadBatchSize=0;var c={type:scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR,amount:1},d=n&&n.type?n:c;return"number"==typeof n?p.preloadAdditionalHeight=n:"object"===(void 0===d?"undefined":_typeof(d))&&d.type===scaleEnum.CONTAINER_HEIGHT_SCALE_FACTOR?p.preloadAdditionalHeight=p.containerHeight*d.amount:p.preloadAdditionalHeight=0,Object.assign(a,p)}function buildHeightStyle(e){return{width:"100%",height:Math.ceil(e)}}var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e},ConstantInfiniteComputer=require("../computers/constantInfiniteComputer.js"),ArrayInfiniteComputer=require("../computers/arrayInfiniteComputer.js"),scaleEnum=require("./scaleEnum"),React=global.React||require("react"),window=require("./window");module.exports={createInfiniteComputer:createInfiniteComputer,recomputeApertureStateFromOptionsAndScrollTop:recomputeApertureStateFromOptionsAndScrollTop,generateComputedProps:generateComputedProps,buildHeightStyle:buildHeightStyle};


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"../computers/arrayInfiniteComputer.js":5,"../computers/constantInfiniteComputer.js":6,"./scaleEnum":12,"./window":13,"react":undefined}],12:[function(require,module,exports){
"use strict";module.exports={CONTAINER_HEIGHT_SCALE_FACTOR:"containerHeightScaleFactor"};


},{}],13:[function(require,module,exports){
(function (global){
"use strict";var win;win="undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{},module.exports=win;


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}]},{},[1])(1)
});