/* eslint-env jest */

// Under certain conditions React Infinite cannot run at all. This
// is when required props are not provided, or if the props provided
// do not make sense. This logic is centralized in checkProps, and
// throws an error.

import React from 'react';
import Infinite from '../src/react-infinite.jsx';
import renderer from 'react-test-renderer';

describe('Errors when the container height is not provided in some way', function() {
  it('throws an error when neither containerHeight nor useWindowAsScrollContainer is not provided', function() {
    var errorfulInfinite = (
      <Infinite elementHeight={22}>
        <div />
        <div />
      </Infinite>
    );

    expect(function() {
      renderer.create(errorfulInfinite);
    }).toThrow(
      'Invariant Violation: Either containerHeight or useWindowAsScrollContainer must be provided.'
    );
  });
});

describe('Errors when the elementHeight does not make sense', function() {
  it('throws an error when the elementHeight is neither a number nor an array', function() {
    var errorfulInfinite = (
      <Infinite
        elementHeight={'not a sensible element height'}
        containerHeight={400}
      >
        <div />
        <div />
      </Infinite>
    );

    expect(function() {
      renderer.create(errorfulInfinite);
    }).toThrow(
      'Invariant Violation: You must provide either a number or an array of numbers as the elementHeight.'
    );
  });
});

describe('Errors an error on elementHeight array length mismatch', function() {
  it('throws an error when the number of children is not equal to the length of the elementHeight array when ', function() {
    var errorfulInfinite = (
      <Infinite elementHeight={[1, 2, 3]} containerHeight={400}>
        <div />
        <div />
      </Infinite>
    );

    expect(function() {
      renderer.create(errorfulInfinite);
    }).toThrow(
      'Invariant Violation: There must be as many values provided in the elementHeight prop as there are children.'
    );
  });
});
