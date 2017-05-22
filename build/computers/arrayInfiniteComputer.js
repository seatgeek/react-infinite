'use strict';

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; desc = parent = undefined; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var InfiniteComputer = require('./infiniteComputer.js'),
    bs = require('../utils/binaryIndexSearch.js');

var ArrayInfiniteComputer = (function (_InfiniteComputer) {
  _inherits(ArrayInfiniteComputer, _InfiniteComputer);

  function ArrayInfiniteComputer(heightData, numberOfChildren) {
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
    value: function maybeIndexToIndex(index) {
      if (typeof index === 'undefined' || index === null) {
        return this.prefixHeightData.length - 1;
      } else {
        return index;
      }
    }
  }, {
    key: 'getTotalScrollableHeight',
    value: function getTotalScrollableHeight() {
      var length = this.prefixHeightData.length;
      return length === 0 ? 0 : this.prefixHeightData[length - 1];
    }
  }, {
    key: 'getDisplayIndexStart',
    value: function getDisplayIndexStart(windowTop) {
      var foundIndex = bs.binaryIndexSearch(this.prefixHeightData, windowTop, bs.opts.CLOSEST_HIGHER);
      return this.maybeIndexToIndex(foundIndex);
    }
  }, {
    key: 'getDisplayIndexEnd',
    value: function getDisplayIndexEnd(windowBottom) {
      var foundIndex = bs.binaryIndexSearch(this.prefixHeightData, windowBottom, bs.opts.CLOSEST_HIGHER);
      return this.maybeIndexToIndex(foundIndex);
    }
  }, {
    key: 'getTopSpacerHeight',
    value: function getTopSpacerHeight(displayIndexStart) {
      var previous = displayIndexStart - 1;
      return previous < 0 ? 0 : this.prefixHeightData[previous];
    }
  }, {
    key: 'getBottomSpacerHeight',
    value: function getBottomSpacerHeight(displayIndexEnd) {
      if (displayIndexEnd === -1) {
        return 0;
      }
      return this.getTotalScrollableHeight() - this.prefixHeightData[displayIndexEnd];
    }
  }]);

  return ArrayInfiniteComputer;
})(InfiniteComputer);

module.exports = ArrayInfiniteComputer;