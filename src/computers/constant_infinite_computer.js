var InfiniteComputer = require('./infinite_computer.js');

class ConstantInfiniteComputer extends InfiniteComputer {
  getTotalScrollableHeight() {
    return this.heightData * this.numberOfChildren;
  }

  getDisplayIndexStart(windowTop) {
    return Math.floor(windowTop / this.heightData);
  }

  getDisplayIndexEnd(windowBottom) {
    var nonZeroIndex = Math.ceil(windowBottom / this.heightData);
    if (nonZeroIndex > 0) {
      return nonZeroIndex - 1;
    }
    return nonZeroIndex;
  }

  getTopSpacerHeight(displayIndexStart) {
    return displayIndexStart * this.heightData;
  }

  getBottomSpacerHeight(displayIndexEnd) {
    var nonZeroIndex = displayIndexEnd + 1;
    return Math.max(0, (this.numberOfChildren - nonZeroIndex) * this.heightData);
  }
}

module.exports = ConstantInfiniteComputer;
