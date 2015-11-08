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
var shallowRenderer = TestUtils.createRenderer();

describe('The Basic Behavior of the Bottom Upwards Display', function() {

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

  it('renders a space-filling top spacer div when the total element height is less than the container height when using the window as the container', function() {
    var infinite = <Infinite elementHeight={100}
                             containerHeight={800}
                             displayBottomUpwards
                             useWindowAsContainer>
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

  it('does not render a space-filling top spacer div when the total element height begins to exceed the container height when using the window as the container', function() {
    var infinite = <Infinite elementHeight={100}
                             containerHeight={800}
                             useWindowAsScrollContainer
                             displayBottomUpwards
                             useWindowAsContainer>
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

describe('The Bottom Scroll Preserving Behavior of the Bottom Upwards Display', function() {
  // Check that it handles browser elasticity as well

  it('keeps the scroll attached to the bottom even when the element is capable of scrolling upwards', function() {
    var rootNode = TestUtils.renderIntoDocument(
      <Infinite elementHeight={100}
                containerHeight={800}
                displayBottomUpwards>
        {renderHelpers.divGenerator(20, 100)}
      </Infinite>
    );

    var rootDomNode = React.findDOMNode(rootNode);
    expect(rootDomNode.scrollTop).toEqual(1200);
  });

  it('keeps the scroll attached to the bottom even when the element is capable of scrolling upwards when the window is used as the container', function () {
    window.scroll = jest.genMockFunction();
    runs(function () {
      TestUtils.renderIntoDocument(
        <Infinite elementHeight={100}
                  displayBottomUpwards
                  useWindowAsScrollContainer>
          {renderHelpers.divGenerator(20, 100)}
        </Infinite>
      )
    });

    waitsFor(function() {
      return window.scroll.mock.calls.length > 0;
    });

    runs(function() {
      expect(window.scroll).lastCalledWith(0, 2000 - window.innerHeight);
    });
  });

  it('allows upwards scrolling to proceed once the user starts scrolling', function() {
    var rootNode = TestUtils.renderIntoDocument(
      <Infinite elementHeight={100}
                containerHeight={800}
                displayBottomUpwards>
        {renderHelpers.divGenerator(20, 100)}
      </Infinite>
    );

    var rootDOMNode = React.findDOMNode(rootNode);
    rootDOMNode.scrollTop = 504;
    TestUtils.Simulate.scroll(rootDOMNode, {
      target: rootDOMNode
    });

    expect(rootDOMNode.scrollTop).toEqual(504);
  });
});

describe('The Infinite Loading Triggering Behavior of the Bottom Upwards Display', function() {

});

describe('The Infinite Loading Scroll Maintenance Behavior of the Bottom Upwards Display', function() {

});
