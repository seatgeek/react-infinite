// An infinite computer must be able to do the following things:
//  1. getTotalScrollableHeight()
//  2. getDisplayIndexStart()
//  3. getDisplayIndexEnd()

class InfiniteComputer {
  constructor(heightData, children) {
    this.heightData = heightData;
    this.children = children;
  }
}

module.exports = InfiniteComputer;
