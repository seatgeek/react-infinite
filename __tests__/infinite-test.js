jest.dontMock('../dist/react-infinite.js');

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var Infinite = require('../dist/react-infinite.js');

describe('infinite', function() {
  it('throws an error when given only one child', function() {
    expect(function() {
      TestUtils.renderIntoDocument(
        <Infinite elementHeight={200}
                  containerHeight={800}
                  className={"root-scrollable-node"}>
          <div/>
        </Infinite>
      );
    }).toThrow();
  });

  it('renders itself into the DOM', function() {
    var infinite = TestUtils.renderIntoDocument(
        <Infinite elementHeight={200}
                  containerHeight={800}
                  className={"root-scrollable-node"}>
          <div/>
          <div/>
        </Infinite>
      );

    var rootScrollable = TestUtils.findRenderedDOMComponentWithClass(infinite, 'root-scrollable-node')
    expect(rootScrollable).not.toBeUndefined();
  });
})
