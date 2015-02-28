jest.dontMock('../src/computers/array_infinite_computer.js');
jest.dontMock('../src/computers/infinite_computer.js');

var ArrayInfiniteComputer = require('../src/computers/array_infinite_computer.js');

describe("Array Infinite Computer", function() {
  it("provides the correct sum of its children", function() {
    var aic = new ArrayInfiniteComputer([10, 20, 40, 80], []);
    expect(aic.getTotalScrollableHeight()).toEqual(150);
  });

  it("provides the correct mixed sum of its children", function() {
    var aic = new ArrayInfiniteComputer([10, 140, 12, 10, 204], []);
    expect(aic.getTotalScrollableHeight()).toEqual(376);
  });

  it("provides the correct constant sum of its children", function() {
    var aic = new ArrayInfiniteComputer([100, 100, 100, 100], []);
    expect(aic.getTotalScrollableHeight()).toEqual(400);
  });

  it("provides the correct empty sum of its children", function() {
    var aic = new ArrayInfiniteComputer([], []);
    expect(aic.getTotalScrollableHeight()).toEqual(0);
  });
})
