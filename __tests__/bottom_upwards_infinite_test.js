/* eslint-env jest */

jest.dontMock('../src/react-infinite.jsx');
jest.dontMock('../src/computers/infiniteComputer.js');
jest.dontMock('../src/computers/constantInfiniteComputer.js');
jest.dontMock('../src/computers/arrayInfiniteComputer.js');
jest.dontMock('../src/utils/binaryIndexSearch.js');
jest.dontMock('../src/utils/infiniteHelpers.js');
jest.dontMock('lodash.isfinite');
jest.dontMock('lodash.isarray');

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var Infinite = require('../src/react-infinite.jsx');

var renderHelpers = require('./helpers/renderHelpers');

describe('The Basic Behavior of the Bottom Upwards Display', function () {
  it('does not throw an error when set', function () {
    expect(function() {
      TestUtils.renderIntoDocument(
        <Infinite elementHeight={200}
                  containerHeight={800}
                  className={"root-scrollable-node"}
                  displayBottomUpwards>
        </Infinite>
      );
    }).not.toThrow();
  });

  it('renders a space-filling div when the total element height is less than the container height', function () {
    var rootNode = <Infinite elementHeight={200}
                             containerHeight={800}
                             className={"root-scrollable-node"}
                             displayBottomUpwards>
      {renderHelpers.divGenerator(1, 100)}
    </Infinite>;
  });
});

describe('The Downwards-Pinning Behavior of the Bottom Upwards Display', function () {

});

describe('The Infinite Loading Maintenance Behavior of the Bottom Upwards Display', function () {

});
