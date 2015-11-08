/* eslint-env jest */

jest.dontMock('../src/react-infinite.jsx');
jest.dontMock('../src/computers/infiniteComputer.js');
jest.dontMock('../src/computers/constantInfiniteComputer.js');
jest.dontMock('../src/computers/arrayInfiniteComputer.js');
jest.dontMock('../src/utils/binaryIndexSearch.js');
jest.dontMock('../src/utils/infiniteHelpers.js');
jest.dontMock('./helpers/renderHelpers.js');
jest.dontMock('lodash.isfinite');
jest.dontMock('lodash.isarray');

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var Infinite = require('../src/react-infinite.jsx');

var renderHelpers = require('./helpers/renderHelpers');

describe('The Basic Behavior of the Bottom Upwards Display', function() {
  var shallowRenderer = TestUtils.createRenderer();

  it('does not throw an error when set', function() {
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

  it('renders a space-filling top spacer div when the total element height is less than the container height', function() {
    var infinite = <Infinite elementHeight={100}
                             containerHeight={800}
                             className={"root-scrollable-node"}
                             displayBottomUpwards>
      {renderHelpers.divGenerator(1, 100)}
    </Infinite>;
    shallowRenderer.render(infinite);

    var rootNode = shallowRenderer.getRenderOutput();
    expect(rootNode.props.children.props.children[0]).toEqual(
      <div ref="topSpacer"
           style={{
             width: '100%',
             height: 700
           }}/>
    );
  });

  it('does not render a space-filling top spacer div when the total element height begins to exceed the container height', function() {
    var infinite = <Infinite elementHeight={100}
                             containerHeight={800}
                             className={"root-scrollable-node"}
                             displayBottomUpwards>
      {renderHelpers.divGenerator(9, 100)}
    </Infinite>;
    shallowRenderer.render(infinite);

    var rootNode = shallowRenderer.getRenderOutput();
    expect(rootNode.props.children.props.children[0]).toEqual(
      <div ref="topSpacer"
           style={{
             width: '100%',
             height: 0
           }}/>
    );
  });
});

describe('The Downwards-Pinning Behavior of the Bottom Upwards Display', function() {

});

describe('The Infinite Loading Maintenance Behavior of the Bottom Upwards Display', function() {

});
