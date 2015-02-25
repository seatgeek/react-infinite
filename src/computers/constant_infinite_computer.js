var InfiniteComputer = require('./infinite_computer.js');

class ConstantInfiniteComputer extends InfiniteComputer {
  getTotalScrollableHeight() {
    return this.heightData * this.children.length;
  }

  getDisplayIndexStart(windowTop) {
    return Math.floor(windowTop / this.heightData);
  }

  getDisplayIndexEnd(windowBottom) {
    return Math.ceil(windowBottom / this.heightData);
  }
}

module.exports = ConstantInfiniteComputer;
