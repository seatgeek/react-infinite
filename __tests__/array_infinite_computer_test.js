jest.dontMock('../src/utils/binary_index_search.js');
jest.dontMock('../src/computers/array_infinite_computer.js');
jest.dontMock('../src/computers/infinite_computer.js');

var ArrayInfiniteComputer = require('../src/computers/array_infinite_computer.js');

describe("Array Infinite Computer", () => {

  describe("getTotalScrollableHeight()", () => {
    it("provides the correct sum of its children", () => {
      var aic = new ArrayInfiniteComputer([10, 20, 40, 80], 0);
      expect(aic.getTotalScrollableHeight()).toEqual(150);
    });

    it("provides the correct mixed sum of its children", () => {
      var aic = new ArrayInfiniteComputer([10, 140, 12, 10, 204], 0);
      expect(aic.getTotalScrollableHeight()).toEqual(376);
    });

    it("provides the correct constant sum of its children", () => {
      var aic = new ArrayInfiniteComputer([100, 100, 100, 100], 0);
      expect(aic.getTotalScrollableHeight()).toEqual(400);
    });

    it("provides the correct empty sum of its children", () => {
      var aic = new ArrayInfiniteComputer([], 0);
      expect(aic.getTotalScrollableHeight()).toEqual(0);
    });
  });

  describe("getDisplayIndexStart()", () => {
    it("computes the correct display index when precisely at element border", () => {
      var aic = new ArrayInfiniteComputer([20, 30, 40, 50, 60, 70, 80, 90, 100], 8);
      expect(aic.getDisplayIndexStart(200)).toEqual(4);
    });

    it("computes the correct display index when not precisely at element border", () => {
      var aic = new ArrayInfiniteComputer([20, 30, 40, 50, 60, 70, 80, 90, 100], 8);
      expect(aic.getDisplayIndexStart(130)).toEqual(3);
    });

    it("computes a zero display index correctly", () => {
      var aic = new ArrayInfiniteComputer([20, 30, 40, 50, 60, 70, 80, 90, 100], 8);
      expect(aic.getDisplayIndexStart(0)).toEqual(0);
    });

    xit("computes indexes correctly with zero-height elements", () => {
    });
  });

  describe("getDisplayIndexEnd()", () => {
    it("computes the correct display index when precisely at element border", () => {
      var aic = new ArrayInfiniteComputer([130, 120, 110, 100, 90, 80, 70], 7);
      expect(aic.getDisplayIndexEnd(550)).toEqual(5);
    });

    it("computes the correct display index when not precisely at element border", () => {
      var aic = new ArrayInfiniteComputer([130, 120, 110, 100, 90, 80, 70], 7);
      expect(aic.getDisplayIndexEnd(444)).toEqual(4);
    });

    xit("computes indexes correctly with zero-height elements", () => {
    });
  });

  describe("getTopSpacerHeight()", () => {
    it("correctly computes a zero top spacer height", () => {
      var aic = new ArrayInfiniteComputer([40, 80, 160, 320], 4);
      expect(aic.getTopSpacerHeight(0)).toEqual(0);
    });

    it("correctly computes a regular top spacer height", () => {
      var aic = new ArrayInfiniteComputer([40, 80, 160, 320], 4);
      expect(aic.getTopSpacerHeight(2)).toEqual(120);
    });
  });

  describe("getBottomSpacerHeight()", () => {
    it("correctly computes a zero bottom spacer height", () => {
      // Note the displayIndexEnd is not inclusive
      var aic = new ArrayInfiniteComputer([20, 40, 80, 160], 4);
      expect(aic.getBottomSpacerHeight(4)).toEqual(0);
    });

    it("correctly computes a regular bottom spacer height", () => {
      var aic = new ArrayInfiniteComputer([20, 40, 80, 160], 4);
      expect(aic.getBottomSpacerHeight(3)).toEqual(160);
    });
  });
});
