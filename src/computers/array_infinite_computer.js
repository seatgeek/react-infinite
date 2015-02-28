var InfiniteComputer = require('./infinite_computer.js'),
    bs = require('../utils/binary_index_search.js');

class ArrayInfiniteComputer extends InfiniteComputer {
  constructor(heightData, children) {
    super(heightData, children);
    this.prefixHeightData = this.heightData.reduce((acc, next) => {
      if (acc.length === 0) {
        return [next];
      } else {
        acc.push(acc[acc.length - 1] + next);
        return acc;
      }
    }, []);
  }

  getTotalScrollableHeight() {
    var length = this.prefixHeightData.length;
    return length === 0 ? 0 : this.prefixHeightData[length - 1];
  }

  getDisplayIndexStart(windowTop) {
    return bs.binaryIndexSearch(this.prefixHeightData, windowTop, bs.opts.CLOSEST_LOWER);
  }

  getDisplayIndexEnd(windowBottom) {
    return bs.binaryIndexSearch(this.prefixHeightData, windowBottom, bs.opts.CLOSEST_HIGHER);
  }
}

module.exports = ArrayInfiniteComputer;
