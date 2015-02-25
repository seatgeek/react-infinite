var InfiniteComputer = require('./infinite_computer.js');

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
    }, [])
  }

  getTotalScrollableHeight() {
    return this.prefixHeightData[this.prefixHeightData.length - 1];
  }

  getDisplayIndexStart(windowTop) {
  }

  getDisplayIndexEnd(windowBottom) {
  }
}

module.exports = ArrayInfiniteComputer;
