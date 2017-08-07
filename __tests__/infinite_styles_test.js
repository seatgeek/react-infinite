/* eslint-env jest */

// Under certain conditions React Infinite cannot run at all. This
// is when required props are not provided, or if the props provided
// do not make sense. This logic is centralized in checkProps, and
// throws an error.

import React from 'react';
import Infinite from '../src/react-infinite.jsx';
import renderer from 'react-test-renderer';

describe('Infinite Styles Override: can override styles on the scrollable container', function() {
  it('will be able to override styles on the scrollable container', function() {
    const rootNode = renderer.create(
      <Infinite
        elementHeight={200}
        containerHeight={800}
        className={'correct-class-name'}
        styles={{ scrollableStyle: { overflowY: 'hidden' } }}
      >
        <div className={'test-div-0'} />
        <div className={'test-div-1'} />
      </Infinite>
    );

    expect(rootNode).toMatchSnapshot();
  });
});
