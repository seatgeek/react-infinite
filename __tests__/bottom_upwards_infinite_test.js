/* eslint-env jest */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import Infinite from '../src/react-infinite.jsx';
import renderer from 'react-test-renderer';
import { mount } from 'enzyme';

import renderHelpers from './helpers/renderHelpers';

describe('The Basic Behavior of the Bottom Upwards Display', function() {
  it('does not throw an error when set', function() {
    expect(function() {
      renderer.create(
        <Infinite
          elementHeight={200}
          containerHeight={800}
          className={'root-scrollable-node'}
          displayBottomUpwards
        />
      );
    }).not.toThrow();
  });

  it('renders a space-filling top spacer div when the total element height is less than the container height', function() {
    var infinite = renderer.create(
      <Infinite elementHeight={100} containerHeight={800} displayBottomUpwards>
        {renderHelpers.divGenerator(1, 100)}
      </Infinite>
    );

    expect(infinite).toMatchSnapshot();
  });

  // jsdom cannot do offsetheight
  // it('takes the loading spinner height into account when rendering the space-filling top spacer div', function() {
  //  var infinite = <Infinite elementHeight={100}
  //                           containerHeight={800}
  //                           loadingSpinnerDelegate={<div style={{height: 100}}/>}
  //                           displayBottomUpwards>
  //    {renderHelpers.divGenerator(1, 100)}
  //  </Infinite>;
  //  shallowRenderer.render(infinite);
  //
  //  var rootNode = shallowRenderer.getRenderOutput();
  //  expect(rootNode.props.children.props.children[0]).toEqual(
  //    <div ref="topSpacer"
  //         style={{
  //           width: '100%',
  //           height: 600
  //         }}/>
  //  );
  // });

  it('does not render a space-filling top spacer div when the total element height begins to exceed the container height', function() {
    var infinite = renderer.create(
      <Infinite elementHeight={100} containerHeight={800} displayBottomUpwards>
        {renderHelpers.divGenerator(9, 100)}
      </Infinite>
    );
    expect(infinite).toMatchSnapshot();
  });

  it('renders a space-filling top spacer div when the total element height is less than the container height when using the window as the container', function() {
    var infinite = renderer.create(
      <Infinite
        elementHeight={100}
        containerHeight={800}
        displayBottomUpwards
        useWindowAsContainer
      >
        {renderHelpers.divGenerator(1, 100)}
      </Infinite>
    );

    expect(infinite).toMatchSnapshot();
  });

  it('does not render a space-filling top spacer div when the total element height begins to exceed the container height when using the window as the container', function() {
    var infinite = renderer.create(
      <Infinite
        elementHeight={100}
        containerHeight={800}
        useWindowAsScrollContainer
        displayBottomUpwards
        useWindowAsContainer
      >
        {renderHelpers.divGenerator(9, 100)}
      </Infinite>
    );

    expect(infinite).toMatchSnapshot();
  });
});

describe('The Bottom Scroll Preserving Behavior of the Bottom Upwards Display', function() {
  // Check that it handles browser elasticity as well

  it('keeps the scroll attached to the bottom even when the element is capable of scrolling upwards', function() {
    const rootNode = mount(
      <Infinite elementHeight={100} containerHeight={800} displayBottomUpwards>
        {renderHelpers.divGenerator(20, 100)}
      </Infinite>
    );

    expect(rootNode.getDOMNode().scrollTop).toEqual(1200);
  });

  it('keeps the scroll attached to the bottom even when the element is capable of scrolling upwards when the window is used as the container', function() {
    window.scroll = jest.genMockFunction();
    window.innerHeight = 768;

    mount(
      <Infinite
        elementHeight={100}
        displayBottomUpwards
        useWindowAsScrollContainer
      >
        {renderHelpers.divGenerator(20, 100)}
      </Infinite>
    );

    return Promise.resolve().then(() => {
      expect(window.scroll).lastCalledWith(0, 2000 - 768);
    });
  });

  it('allows upwards scrolling to proceed once the user starts scrolling', function() {
    const rootNode = mount(
      <Infinite elementHeight={100} containerHeight={800} displayBottomUpwards>
        {renderHelpers.divGenerator(20, 100)}
      </Infinite>
    );

    const rootDomNode = rootNode.getDOMNode();
    // Secretly set the scroll to 504 without telling the component
    rootDomNode.scrollTop = 504;
    // Simulates the user scrolling upwards to 504
    rootNode.simulate('scroll', {
      target: rootDomNode
    });

    expect(rootDomNode.scrollTop).toEqual(504);
  });
});

describe('The Infinite Loading Triggering Behavior of the Bottom Upwards Display', function() {
  it('triggers when the user passes the required point when scrolling upwards', function() {
    const infiniteLoader = jest.genMockFunction();
    const rootNode = mount(
      <Infinite
        elementHeight={100}
        infiniteLoadBeginEdgeOffset={300}
        onInfiniteLoad={infiniteLoader}
        containerHeight={800}
        displayBottomUpwards
      >
        {renderHelpers.divGenerator(20, 100)}
      </Infinite>
    );

    const rootDomNode = rootNode.getDOMNode();
    rootDomNode.scrollTop = 299;
    rootNode.simulate('scroll', {
      target: rootDomNode
    });

    expect(infiniteLoader.mock.calls.length).toEqual(1);
  });

  it('does not trigger when the user does not pass the required point when scrolling upwards', function() {
    const infiniteLoader = jest.genMockFunction();
    const rootNode = mount(
      <Infinite
        elementHeight={100}
        infiniteLoadBeginEdgeOffset={300}
        onInfiniteLoad={infiniteLoader}
        containerHeight={800}
        displayBottomUpwards
      >
        {renderHelpers.divGenerator(20, 100)}
      </Infinite>
    );

    const rootDomNode = rootNode.getDOMNode();
    rootDomNode.scrollTop = 301;
    rootNode.simulate('scroll', {
      target: rootDomNode
    });

    expect(infiniteLoader.mock.calls.length).toEqual(0);
  });

  it('triggers when the user passes the required point when the window is used as the scroll container', function() {
    var infiniteLoader = jest.genMockFunction();

    const listenerTriggered = new Promise((resolve, reject) => {
      window.addEventListener = function(event, f) {
        if (event === 'scroll') {
          resolve(f);
        }
      };
    });

    mount(
      <Infinite
        elementHeight={100}
        infiniteLoadBeginEdgeOffset={300}
        onInfiniteLoad={infiniteLoader}
        useWindowAsScrollContainer
        displayBottomUpwards
      >
        {renderHelpers.divGenerator(20, 100)}
      </Infinite>
    );

    return listenerTriggered.then(listener => {
      window.pageYOffset = 299;
      listener();
      expect(infiniteLoader.mock.calls.length).toEqual(1);
    });
  });

  it('does not trigger when the user does not pass the required point when the window is used as the scroll container', function() {
    const infiniteLoader = jest.genMockFunction();

    const listenerTriggered = new Promise((resolve, reject) => {
      window.addEventListener = function(event, f) {
        if (event === 'scroll') {
          resolve(f);
        }
      };
    });

    mount(
      <Infinite
        elementHeight={100}
        infiniteLoadBeginEdgeOffset={300}
        onInfiniteLoad={infiniteLoader}
        useWindowAsScrollContainer
        displayBottomUpwards
      >
        {renderHelpers.divGenerator(20, 100)}
      </Infinite>
    );

    return listenerTriggered.then(listener => {
      window.pageYOffset = 301;
      listener();

      expect(infiniteLoader.mock.calls.length).toEqual(0);
    });
  });
});

describe('The Infinite Loading Scroll Maintenance Behavior of the Bottom Upwards Display', function() {
  var renderNode;

  beforeEach(function() {
    renderNode = document.createElement('div');
  });

  var divs = renderHelpers.divGenerator(20, 100);

  it('scrolls to the correct place after new components come in', function() {
    var infiniteLoader = jest.genMockFunction();
    var rootNode = ReactDOM.render(
      <Infinite
        elementHeight={100}
        infiniteLoadBeginEdgeOffset={300}
        onInfiniteLoad={infiniteLoader}
        containerHeight={800}
        displayBottomUpwards
      >
        {divs}
      </Infinite>,
      renderNode
    );

    var rootDOMNode = ReactDOM.findDOMNode(rootNode);
    rootDOMNode.scrollTop = 299;
    TestUtils.Simulate.scroll(rootDOMNode, {
      target: rootDOMNode
    });

    expect(infiniteLoader.mock.calls.length).toEqual(1);

    // The parent component acknowledges that the component
    // is in the infinite loading state
    rootNode = ReactDOM.render(
      <Infinite
        elementHeight={100}
        infiniteLoadBeginEdgeOffset={300}
        onInfiniteLoad={infiniteLoader}
        isInfiniteLoading
        loadingSpinnerDelegate={<div />}
        containerHeight={800}
        displayBottomUpwards
      >
        {divs}
      </Infinite>,
      renderNode
    );

    // The component is now in the infinite loading state. We
    // disable infinite loading and give it new divs.
    rootNode = ReactDOM.render(
      <Infinite
        elementHeight={100}
        infiniteLoadBeginEdgeOffset={300}
        onInfiniteLoad={infiniteLoader}
        isInfiniteLoading={false}
        containerHeight={800}
        displayBottomUpwards
      >
        {renderHelpers.divGenerator(30, 100)}
      </Infinite>,
      renderNode
    );

    // Why is this 1299? Because 10 new components of height 100
    // each enter, presumably from the top. Previously, we scrolled
    // to 299, so the final scrollTop is 1299.
    expect(rootDOMNode.scrollTop).toEqual(1299);
  });

  it('scrolls to the correct place after new components come in when the window is the scroll container', function() {
    var infiniteLoader = jest.genMockFunction();
    window.scroll = jest.genMockFunction();

    const listenerTriggered = new Promise((resolve, reject) => {
      window.addEventListener = function(event, f) {
        if (event === 'scroll') {
          resolve(f);
        }
      };
    });

    ReactDOM.render(
      <Infinite
        elementHeight={100}
        infiniteLoadBeginEdgeOffset={300}
        onInfiniteLoad={infiniteLoader}
        useWindowAsScrollContainer
        displayBottomUpwards
      >
        {divs}
      </Infinite>,
      renderNode
    );

    return listenerTriggered.then(listener => {
      window.pageYOffset = 298;
      listener();

      expect(infiniteLoader.mock.calls.length).toEqual(1);

      ReactDOM.render(
        <Infinite
          elementHeight={100}
          infiniteLoadBeginEdgeOffset={300}
          onInfiniteLoad={infiniteLoader}
          isInfiniteLoading
          loadingSpinnerDelegate={<div />}
          useWindowAsScrollContainer
          displayBottomUpwards
        >
          {divs}
        </Infinite>,
        renderNode
      );

      ReactDOM.render(
        <Infinite
          elementHeight={100}
          infiniteLoadBeginEdgeOffset={300}
          onInfiniteLoad={infiniteLoader}
          isInfiniteLoading={false}
          useWindowAsScrollContainer
          displayBottomUpwards
        >
          {renderHelpers.divGenerator(30, 100)}
        </Infinite>,
        renderNode
      );

      expect(window.scroll).lastCalledWith(0, 1000 + 298);
    });
  });
});
