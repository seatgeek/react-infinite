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
    var foundIndex = bs.binaryIndexSearch(this.prefixHeightData, windowBottom, bs.opts.CLOSEST_HIGHER);
    return typeof foundIndex === 'undefined' ? this.prefixHeightData.length - 1 : foundIndex; 
  }

  getTopSpacerHeight(displayIndexStart) {
    var previous = displayIndexStart - 1;
    return previous < 0 ? 0 : this.prefixHeightData[previous];
  }

  getBottomSpacerHeight(displayIndexEnd) {
    if (displayIndexEnd === -1) return 0;
    return this.getTotalScrollableHeight() - this.prefixHeightData[displayIndexEnd];
  }
}

module.exports = ArrayInfiniteComputer;
