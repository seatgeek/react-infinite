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

  getTopSpacerHeight() {
    return this.getDisplayIndexStart * this.heightData;
  }

  getBottomSpacerHeight() {
    return (this.numberOfChildren - this.getDisplayIndexEnd()) * this.heightData;
  }
}

module.exports = ConstantInfiniteComputer;
