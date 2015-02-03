jest.dontMock('../dist/react-infinite.js');

describe('infinite', function() {
  it('does something', function() {
    var React = require('react/addons');
    var Infinite = require('../dist/react-infinite.js');
    var TestUtils = React.addons.TestUtils;
    var child = <div/>;
    var Infinite = TestUtils.renderIntoDocument(
      <Infinite elementHeight={200} containerHeight={800}>
        <div/>
      </Infinite>
    );
    expect(1).toBe(1);
  })
})
