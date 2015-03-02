var InfiniteComputer = require('./infinite_computer.js');

class ConstantInfiniteComputer extends InfiniteComputer {
  getTotalScrollableHeight() {
    return this.heightData * this.numberOfChildren;
  }

  getDisplayIndexStart(windowTop) {
    return Math.floor(windowTop / this.heightData);
  }

  getDisplayIndexEnd(windowBottom) {
    return Math.ceil(windowBottom / this.heightData);
  }

  getTopSpacerHeight(displayIndexStart) {
    return displayIndexStart * this.heightData;
  }

  getBottomSpacerHeight(displayIndexEnd) {
    return Math.max(0, (this.numberOfChildren - displayIndexEnd) * this.heightData);
  }
}

module.exports = ConstantInfiniteComputer;
