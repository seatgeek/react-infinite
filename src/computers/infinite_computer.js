// An infinite computer must be able to do the following things:
//  1. getTotalScrollableHeight()
//  2. getDisplayIndexStart()
//  3. getDisplayIndexEnd()

class InfiniteComputer {
  constructor(heightData, numberOfChildren) {
    this.heightData = heightData;
    this.numberOfChildren = numberOfChildren;
  }

  getTotalScrollableHeight() {
    throw new Error("getTotalScrollableHeight not implemented.");
  }

  getDisplayIndexStart(windowTop) {
    throw new Error("getDisplayIndexStart not implemented.");
  }

  getDisplayIndexEnd(windowBottom) {
    throw new Error("getDisplayIndexEnd not implemented.");
  }

  // These are helper methods, and can be calculated from
  // the above details.
  getTopSpacerHeight(displayIndexStart) {
    throw new Error("getTopSpacerHeight not implemented.");
  }

  getBottomSpacerHeight(displayIndexEnd) {
    throw new Error("getBottomSpacerHeight not implemented.");
  }
}

module.exports = InfiniteComputer;
