var InfiniteComputer = require('./infinite_computer.js'),
    bs = require('../utils/binary_index_search.js');

class ArrayInfiniteComputer extends InfiniteComputer {
  constructor(heightData, numberOfChildren) {
    super(heightData, numberOfChildren);
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
    return bs.binaryIndexSearch(this.prefixHeightData, windowTop, bs.opts.CLOSEST_HIGHER);
  }

  getDisplayIndexEnd(windowBottom) {
    return bs.binaryIndexSearch(this.prefixHeightData, windowBottom, bs.opts.CLOSEST_HIGHER) + 1;
  }

  getTopSpacerHeight(displayIndexStart) {
    var previous = displayIndexStart - 1;
    return previous < 0 ? 0 : this.prefixHeightData[previous];
  }

  getBottomSpacerHeight(displayIndexEnd) {
    var previous = displayIndexEnd - 1;
    if (displayIndexEnd === 0) {
      return this.getTotalScrollableHeight();
    } else if (displayIndexEnd >= this.prefixHeightData.length) {
      return 0;
    } else {
      return this.getTotalScrollableHeight() - this.prefixHeightData[previous];
    }
  }
}

module.exports = ArrayInfiniteComputer;
