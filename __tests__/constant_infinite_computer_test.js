jest.dontMock('../src/computers/constant_infinite_computer.js');
jest.dontMock('../src/computers/infinite_computer.js');

var ConstantInfiniteComputer = require('../src/computers/constant_infinite_computer.js');

describe("Constant Infinite Computer", function() {

  describe("getTotalScrollableHeight()", function() {
    it("provides the correct sum of its children", function() {
      var cic = new ConstantInfiniteComputer(26, 92);
      expect(cic.getTotalScrollableHeight()).toEqual(2392);
    });
  })

  describe("getDisplayIndexStart()", function() {
    var cic;
    beforeEach(function() {
      cic = new ConstantInfiniteComputer(33, 50);
    })

    it("computes the correct display index when precisely at element border", function() {
      expect(cic.getDisplayIndexStart(66)).toEqual(2);
    });

    it("computes the correct display index when before element border", function() {
      // We display one more element if the windowTop is not
      // exactly at an element border
      expect(cic.getDisplayIndexStart(47)).toEqual(1);
    });

    it("computes a zero display index correctly", function() {
      expect(cic.getDisplayIndexStart(0)).toEqual(0);
    });
  });

  describe("getDisplayIndexEnd()", function() {
    var cic;
    beforeEach(function() {
      cic = new ConstantInfiniteComputer(47, 22);
    })

    it("computes the correct display index when precisely at element border", function() {
      // Again, we err in favor of displaying one more element
      expect(cic.getDisplayIndexEnd(611)).toEqual(13);
    });

    it("computes the correct display index when below element border", function() {
      expect(cic.getDisplayIndexEnd(417)).toEqual(9);
    });

    it("computes a zero display index correctly", function() {
      expect(cic.getDisplayIndexEnd(0)).toEqual(0);
    });
  });

  describe("getTopSpacerHeight()", function() {

  });

  describe("getBottomSpacerHeight()", function() {

  });

});
