/* eslint-env jest */

// Under certain conditions React Infinite cannot run at all. This
// is when required props are not provided, or if the props provided
// do not make sense. This logic is centralized in checkProps, and
// throws an error.

jest.dontMock('../src/react-infinite.jsx');
jest.dontMock('../src/computers/infiniteComputer.js');
jest.dontMock('../src/computers/constantInfiniteComputer.js');
jest.dontMock('../src/computers/arrayInfiniteComputer.js');
jest.dontMock('../src/utils/binaryIndexSearch.js');
jest.dontMock('../src/utils/infiniteHelpers.js');
jest.dontMock('../src/utils/window.js');
jest.dontMock('./helpers/renderHelpers.js');
jest.dontMock('lodash.isfinite');
jest.dontMock('lodash.isarray');
jest.dontMock('react-dom');

var React = require('react');
var TestUtils = require('react-dom/test-utils');
var Infinite = require('../src/react-infinite.jsx');


describe('Infinite Styles Override: can override styles on the scrollable container', function() {
  it('will be able to override styles on the scrollable container', function() {
    var rootNode = TestUtils.renderIntoDocument(
      <Infinite elementHeight={200}
                containerHeight={800}
                className={"correct-class-name"}
                styles={{scrollableStyle: {'overflowY': 'hidden'}}}>
        <div className={"test-div-0"}/>
        <div className={"test-div-1"}/>
      </Infinite>
    );

    var styles = rootNode.scrollable._style._values;
    expect(styles.height).toEqual('800px');
    expect(styles['overflow-x']).toEqual('hidden');
    expect(styles['overflow-y']).toEqual('hidden');
  });
});
