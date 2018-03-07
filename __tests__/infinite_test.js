/* eslint-env jest, jasmine */

import React from 'react';
import createReactClass from 'create-react-class';
import renderer from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import Infinite from '../src/react-infinite.jsx';
import { mountToJson } from 'enzyme-to-json';
import renderHelpers from './helpers/renderHelpers';

const enzymeToJsonOpts = {
  noKey: true,
  deep: false
};

describe('Rendering the React Infinite Component Wrapper', function() {
  it('does not throw an error when given no children', function() {
    expect(function() {
      renderer.create(
        <Infinite
          elementHeight={200}
          containerHeight={800}
          className={'root-scrollable-node'}
        />
      );
    }).not.toThrow();
  });

  it('does not throw an error when given only one child', function() {
    expect(function() {
      renderer.create(
        <Infinite
          elementHeight={200}
          containerHeight={800}
          className={'root-scrollable-node'}
        >
          <div />
        </Infinite>
      );
    }).not.toThrow();
  });

  it('renders itself into the DOM with the correct container styles', function() {
    const infinite = renderer.create(
      <Infinite
        elementHeight={200}
        containerHeight={800}
        className={'root-scrollable-node'}
      >
        <div />
        <div />
      </Infinite>
    );

    expect(infinite).toMatchSnapshot();
  });

  it('applies the provided class name to the root node', function() {
    const infinite = renderer.create(
      <Infinite
        elementHeight={200}
        containerHeight={800}
        className={'correct-class-name'}
      >
        <div />
        <div />
      </Infinite>
    );

    expect(infinite).toMatchSnapshot();
  });

  it('allows preloadBatchSize to be zero', function() {
    const rootNode = mount(
      <Infinite
        elementHeight={[28, 28]}
        containerHeight={100}
        preloadBatchSize={0}
      >
        <li>Test1</li>
        <li>Test2</li>
      </Infinite>
    );

    const rootDomNode = rootNode.getDOMNode();
    rootDomNode.scrollTop = 1500;
    rootNode.simulate('scroll', {
      target: rootDomNode
    });
  });
});

describe('The Children of the React Infinite Component', function() {
  it('renders its children when no hiding behavior is required', function() {
    const rootNode = renderer.create(
      <Infinite
        elementHeight={200}
        containerHeight={800}
        className={'correct-class-name'}
      >
        <div className={'test-div-0'} />
        <div className={'test-div-1'} />
      </Infinite>
    );

    const tree = rootNode.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders its children when some DOM nodes are hidden', function() {
    const elementHeight = 200;
    const rootNode = renderer.create(
      <Infinite
        elementHeight={elementHeight}
        containerHeight={800}
        className={'correct-class-name'}
      >
        {renderHelpers.divGenerator(10, elementHeight)}
      </Infinite>
    );

    // Why are six nodes rendered? Since we have not scrolled at
    // all, the extent that React Infinite will render is
    // preloadBatchSize + preloadAdditionalHeight below the container.
    //
    // preloadBatchSize defaults to containerHeight / 2 pixels, 400 pixels
    // preloadAdditionalHeight defaults to the containerHeight, 800 pixels
    //
    // Their sum is 1200 pixels, or 6 200-pixel elements.
    const tree = rootNode.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders more children when preloadAdditionalHeight is increased beyond its default', function() {
    const elementHeight = 200;
    const rootNode = renderer.create(
      <Infinite
        elementHeight={elementHeight}
        containerHeight={800}
        preloadAdditionalHeight={1000}
        className={'correct-class-name'}
      >
        {renderHelpers.divGenerator(10, elementHeight)}
      </Infinite>
    );

    // Why are seven nodes rendered? Since we have not scrolled at
    // all, the extent that React Infinite will render is
    // preloadBatchSize + preloadAdditionalHeight below the container.
    //
    // preloadBatchSize defaults to containerHeight / 2 pixels, 400 pixels
    // preloadAdditionalHeight is declared as 1000 pixels
    //
    // Their sum is 1400 pixels, or 7 200-pixel elements.
    const tree = rootNode.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders more children when preloadBatchSize is increased beyond its default', function() {
    const elementHeight = 200;
    const rootNode = renderer.create(
      <Infinite
        elementHeight={elementHeight}
        containerHeight={800}
        preloadBatchSize={800}
        className={'correct-class-name'}
      >
        {renderHelpers.divGenerator(10, elementHeight)}
      </Infinite>
    );

    // Why are eight nodes rendered? Since we have not scrolled at
    // all, the extent that React Infinite will render is
    // preloadBatchSize + preloadAdditionalHeight below the container.
    //
    // preloadBatchSize is declared as 800 pixels
    // preloadAdditionalHeight defaults to containerHeight, 800 pixels
    //
    // Their sum is 1600 pixels, or 8 200-pixel elements.
    const tree = rootNode.toJSON();
    expect(tree).toMatchSnapshot();
  });
});

describe('The Scrolling Behavior of the Constant Height React Infinite Component', function() {
  it('hides visible elements when the user scrolls sufficiently', function() {
    const elementHeight = 200;
    const rootNode = mount(
      <Infinite
        elementHeight={elementHeight}
        containerHeight={800}
        className={'correct-class-name'}
      >
        {renderHelpers.divGenerator(20, elementHeight)}
      </Infinite>
    );

    const rootDomNode = rootNode.getDOMNode();
    rootDomNode.scrollTop = 1500;
    rootNode.simulate('scroll', {
      target: rootDomNode
    });

    //  Schematic
    //  0 pixels: start of topSpacer element
    //  400 pixels: windowTop, start of first displayed element
    //  1200 pixels: blockStart, start of the block that scrollTop of 1500 pixels is in
    //    (the block size default is containerHeight / 2)
    //  1600 pixels: blockEnd, end of block that scrollTop of 1500 pixels is in
    //  2400 pixels: windowBottom, end of first displayed element
    //  4000 pixels: end of bottomSpacer element
    expect(mountToJson(rootNode, enzymeToJsonOpts)).toMatchSnapshot();
  });

  it('functions correctly at the end of its range', function() {
    const elementHeight = 200;
    const rootNode = mount(
      <Infinite
        elementHeight={elementHeight}
        containerHeight={800}
        className={'correct-class-name'}
      >
        {renderHelpers.divGenerator(20, elementHeight)}
      </Infinite>
    );

    // The total scrollable height here is 4000 pixels
    const rootDomNode = rootNode.getDOMNode();
    rootDomNode.scrollTop = 3600;
    rootNode.simulate('scroll', {
      target: rootDomNode
    });

    expect(mountToJson(rootNode, enzymeToJsonOpts)).toMatchSnapshot();
  });
});

describe('The Behavior of the Variable Height React Infinite Component', function() {
  it('hides elements when the user has not yet scrolled', function() {
    // 20  40  200  300  350 500  525 550 575 600 725  805 880 900 1050 1300 1400 (16)
    const elementHeight = [
      20,
      20,
      160,
      100,
      50,
      150,
      25,
      25,
      25,
      25,
      125,
      80,
      75,
      20,
      150,
      250,
      100
    ];
    const rootNode = renderer.create(
      <Infinite
        elementHeight={elementHeight}
        containerHeight={420}
        className={'correct-class-name'}
      >
        {renderHelpers.variableDivGenerator(elementHeight)}
      </Infinite>
    );

    //  Schematic
    //  0 pixels: start of topSpacer element, start of windowTop
    //  420 pixels: end of container
    //  630 pixels: end of windowBottom
    //  1400 pixels: end of bottomSpacer element
    const tree = rootNode.toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('hides visible elements when the user scrolls sufficiently', function() {
    // 20  40  200  300  350 500  525 550 575 600 725  805 880 900 1050 1300 1400 (17)
    const elementHeight = [
      20,
      20,
      160,
      100,
      50,
      150,
      25,
      25,
      25,
      25,
      125,
      80,
      75,
      20,
      150,
      250,
      100
    ];
    const rootNode = mount(
      <Infinite
        elementHeight={elementHeight}
        containerHeight={400}
        className={'correct-class-name'}
      >
        {renderHelpers.variableDivGenerator(elementHeight)}
      </Infinite>
    );

    const rootDomNode = rootNode.getDOMNode();
    rootDomNode.scrollTop = 700;
    rootNode.simulate('scroll', {
      target: rootDomNode
    });

    //  Schematic
    //  0 pixels: start of topSpacer element
    //  200 pixels: windowTop, start of first displayed element
    //  600 pixels: blockStart, start of the block that the scrollTop of 700 pixels is in
    //  800 pixels: blockEnd, end of the block that the scrollTop of 700 pixels is in
    //  1200 pixels: windowBottom, end of displayed element
    //  1400 pixels: end of bottomSpacer element
    expect(mountToJson(rootNode, enzymeToJsonOpts)).toMatchSnapshot();
  });

  it('functions correctly at the end of its range', function() {
    // 20  40  200  300  350 500  525 550 575 600 725  805 880 900 1050 1300 1400 (16)
    const elementHeight = [
      20,
      20,
      160,
      100,
      50,
      150,
      25,
      25,
      25,
      25,
      125,
      80,
      75,
      20,
      150,
      250,
      100
    ];
    const rootNode = mount(
      <Infinite
        elementHeight={elementHeight}
        containerHeight={400}
        className={'correct-class-name'}
      >
        {renderHelpers.variableDivGenerator(elementHeight)}
      </Infinite>
    );

    // The total scrollable height here is 4000 pixels
    const rootDomNode = rootNode.getDOMNode();
    rootDomNode.scrollTop = 1000;
    rootNode.simulate('scroll', {
      target: rootDomNode
    });

    //  Schematic
    //  0 pixels: start of topSpacer element
    //  600 pixels: start of windowTop
    //  1000 pixels: start of block
    //  1400 pixels: end of block
    //  1400 pixels: end of windowBottom
    expect(mountToJson(rootNode, enzymeToJsonOpts)).toMatchSnapshot();
  });
});

describe("React Infinite's Infinite Scroll Capabilities", function() {
  it('infiniteLoadBeginEdgeOffset does not always trigger infinite load on scroll', function() {
    const infiniteSpy = jest.fn();
    const elementHeight = 200;
    const rootNode = mount(
      <Infinite
        elementHeight={elementHeight}
        containerHeight={800}
        onInfiniteLoad={infiniteSpy}
        infiniteLoadBeginEdgeOffset={1000}
        className={'correct-class-name'}
      >
        {renderHelpers.divGenerator(20, elementHeight)}
      </Infinite>
    );

    const rootDomNode = rootNode.getDOMNode();
    rootDomNode.scrollTop = 300;
    rootNode.simulate('scroll', {
      target: rootDomNode
    });

    expect(infiniteSpy).not.toHaveBeenCalled();
  });

  it('triggers the onInfiniteLoad function when scrolling past infiniteLoadBeginEdgeOffset', function() {
    const infiniteSpy = jest.fn();
    const elementHeight = 200;
    const rootNode = mount(
      <Infinite
        elementHeight={elementHeight}
        containerHeight={800}
        onInfiniteLoad={infiniteSpy}
        infiniteLoadBeginEdgeOffset={1000}
        className={'correct-class-name'}
      >
        {renderHelpers.divGenerator(20, elementHeight)}
      </Infinite>
    );

    const rootDomNode = rootNode.getDOMNode();
    rootDomNode.scrollTop = 3600;
    rootNode.simulate('scroll', {
      target: rootDomNode
    });

    expect(infiniteSpy).toHaveBeenCalled();
  });

  it('does not always display the loadingSpinnerDelegate', function() {
    const infiniteSpy = jest.fn();
    const elementHeight = 200;
    const rootNode = mount(
      <Infinite
        elementHeight={elementHeight}
        containerHeight={800}
        onInfiniteLoad={infiniteSpy}
        infiniteLoadBeginEdgeOffset={1000}
        loadingSpinnerDelegate={<div className={'delegate-div'} />}
        className={'correct-class-name'}
      >
        {renderHelpers.divGenerator(20, elementHeight)}
      </Infinite>
    );

    const rootDomNode = rootNode.getDOMNode();
    rootDomNode.scrollTop = 100;
    rootNode.simulate('scroll', {
      target: rootDomNode
    });

    expect(rootNode.find('.delegate-div').exists()).toBe(false);
  });

  it('displays the loadingSpinnerDelegate when isInfiniteLoading', function() {
    const infiniteSpy = jest.fn();
    const elementHeight = 200;
    const rootNode = mount(
      <Infinite
        elementHeight={elementHeight}
        containerHeight={800}
        onInfiniteLoad={infiniteSpy}
        infiniteLoadBeginEdgeOffset={1000}
        loadingSpinnerDelegate={<div className={'delegate-div'} />}
        className={'correct-class-name'}
      >
        {renderHelpers.divGenerator(20, elementHeight)}
      </Infinite>
    );

    const rootDomNode = rootNode.getDOMNode();
    rootDomNode.scrollTop = 3600;
    rootNode.simulate('scroll', {
      target: rootDomNode
    });

    expect(rootNode.find('.delegate-div').exists()).toBe(true);
  });
});

describe("Maintaining React Infinite's internal scroll state", function() {
  it('has does not have pointer-events: none by default', function() {
    const elementHeight = 200;
    const rootNode = shallow(
      <Infinite
        elementHeight={elementHeight}
        containerHeight={800}
        timeScrollStateLastsForAfterUserScrolls={10000}
        className={'correct-class-name'}
      >
        {renderHelpers.divGenerator(20, elementHeight)}
      </Infinite>
    );

    expect(
      rootNode.find('.correct-class-name').childAt(0).props().style
        .pointerEvents
    ).toBeUndefined();
  });

  it('has pointer-events: none upon scroll', function() {
    const elementHeight = 200;
    const rootNode = mount(
      <Infinite
        elementHeight={elementHeight}
        containerHeight={800}
        timeScrollStateLastsForAfterUserScrolls={10000}
        className={'correct-class-name'}
      >
        {renderHelpers.divGenerator(20, elementHeight)}
      </Infinite>
    );

    const rootDomNode = rootNode.getDOMNode();
    rootDomNode.scrollTop = 100;
    rootNode.simulate('scroll', {
      target: rootDomNode
    });

    expect(
      rootNode.find('div.correct-class-name').childAt(0).props().style
        .pointerEvents
    ).toEqual('none');
  });
});

describe('Handling infinite scrolling', function() {
  it('triggers an infinite scroll the first time the component mounts if the elements do not fill the container', function() {
    const infiniteSpy = jest.fn();
    const elementHeight = 200;
    mount(
      <Infinite
        elementHeight={elementHeight}
        containerHeight={800}
        infiniteLoadBeginEdgeOffset={1000}
        onInfiniteLoad={infiniteSpy}
        timeScrollStateLastsForAfterUserScrolls={10000}
        className={'correct-class-name'}
      />
    );

    expect(infiniteSpy).toHaveBeenCalled();
  });

  it('considers a scroll to have occurred when the container itself is scrolled', function() {
    const infiniteSpy = jest.fn();
    const elementHeight = 200;

    const rootNode = mount(
      <Infinite
        elementHeight={elementHeight}
        containerHeight={800}
        handleScroll={infiniteSpy}
        timeScrollStateLastsForAfterUserScrolls={10000}
        className={'correct-class-name'}
      >
        {renderHelpers.divGenerator(20, elementHeight)}
      </Infinite>
    );

    const properDiv = rootNode.find('div.correct-class-name').getDOMNode();
    properDiv.scrollTop = 100;
    rootNode.simulate('scroll', {
      target: properDiv
    });

    expect(infiniteSpy).toHaveBeenCalled();
  });

  it('does not consider an infinite scroll to have occurred when one of its children scrolls', function() {
    const infiniteSpy = jest.fn();
    const elementHeight = 200;

    const rootNode = mount(
      <Infinite
        elementHeight={elementHeight}
        containerHeight={800}
        handleScroll={infiniteSpy}
        timeScrollStateLastsForAfterUserScrolls={10000}
        className={'correct-class-name'}
      >
        {renderHelpers.divGenerator(20, elementHeight)}
      </Infinite>
    );

    const childDiv = rootNode.find('.test-div-0').getDOMNode();
    childDiv.scrollTop = 100;
    rootNode.simulate('scroll', {
      target: childDiv
    });

    expect(infiniteSpy).not.toHaveBeenCalled();
  });
});

describe('React Infinite when the window is used as the Container', function() {
  const elementHeight = 200;
  it('does not attach a scrollable style', function() {
    const rootNode = renderer.create(
      <Infinite
        elementHeight={elementHeight}
        timeScrollStateLastsForAfterUserScrolls={10000}
        className={'correct-class-name'}
        useWindowAsScrollContainer
      >
        {renderHelpers.divGenerator(20, elementHeight)}
      </Infinite>
    );

    expect(rootNode).toMatchSnapshot();
  });

  it('considers a scroll to have occurred when the window is scrolled', function() {
    const infiniteSpy = jest.fn();
    const elementHeight = 200;

    const oldAdd = window.addEventListener;

    const listenerTriggered = new Promise((resolve, reject) => {
      window.addEventListener = function(event, f) {
        if (event === 'scroll') {
          resolve(f);
        }
      };
    });

    mount(
      <Infinite
        elementHeight={elementHeight}
        handleScroll={infiniteSpy}
        timeScrollStateLastsForAfterUserScrolls={10000}
        className={'correct-class-name'}
        useWindowAsScrollContainer
      >
        {renderHelpers.divGenerator(20, elementHeight)}
      </Infinite>
    );

    return listenerTriggered.then(listener => {
      window.pageYOffset = 200;
      listener();
      expect(infiniteSpy).toHaveBeenCalled();
      window.addEventListener = oldAdd;
    });
  });

  it('hides DOM elements that are below the visible range of the window', function() {
    const elementHeight = 200;
    window.innerHeight = 800;

    const rootNode = mount(
      <Infinite
        elementHeight={elementHeight}
        timeScrollStateLastsForAfterUserScrolls={10000}
        className={'correct-class-name'}
        useWindowAsScrollContainer
      >
        {renderHelpers.divGenerator(20, elementHeight)}
      </Infinite>
    );

    expect(mountToJson(rootNode, enzymeToJsonOpts)).toMatchSnapshot();
  });

  it('alters the elements displayed when a scroll has occurred', function() {
    const infiniteSpy = jest.fn();
    const elementHeight = 200;

    const oldAdd = window.addEventListener;

    const listenerTriggered = new Promise((resolve, reject) => {
      window.addEventListener = function(event, f) {
        if (event === 'scroll') {
          resolve(f);
        }
      };
    });

    const rootNode = mount(
      <Infinite
        elementHeight={elementHeight}
        handleScroll={infiniteSpy}
        timeScrollStateLastsForAfterUserScrolls={10000}
        className={'correct-class-name'}
        useWindowAsScrollContainer
      >
        {renderHelpers.divGenerator(20, elementHeight)}
      </Infinite>
    );

    expect(mountToJson(rootNode, enzymeToJsonOpts)).toMatchSnapshot();

    return listenerTriggered.then(listener => {
      window.pageYOffset = 1500;
      listener();
      rootNode.update();
      expect(mountToJson(rootNode, enzymeToJsonOpts)).toMatchSnapshot();
      window.addEventListener = oldAdd;
    });
  });

  it('reacts to window scroll events when useWindowAsScrollContainer is enabled after the initial render', function() {
    const infiniteSpy = jest.fn();
    const elementHeight = 200;

    const oldAdd = window.addEventListener;

    const listenerTriggered = new Promise((resolve, reject) => {
      window.addEventListener = function(event, f) {
        if (event === 'scroll') {
          resolve(f);
        }
      };
    });

    const rootNode = mount(
      <Infinite
        elementHeight={elementHeight}
        handleScroll={infiniteSpy}
        timeScrollStateLastsForAfterUserScrolls={10000}
        className={'correct-class-name'}
        containerHeight={700}
      >
        {renderHelpers.divGenerator(20, elementHeight)}
      </Infinite>
    );

    expect(mountToJson(rootNode, enzymeToJsonOpts)).toMatchSnapshot();
    rootNode.setProps({
      useWindowAsScrollContainer: true
    });

    return listenerTriggered.then(listener => {
      window.pageYOffset = 200;
      listener();
      rootNode.update();
      expect(mountToJson(rootNode, enzymeToJsonOpts)).toMatchSnapshot();
      window.addEventListener = oldAdd;
    });
  });
});

describe("Specifying React Infinite's preload amounts", function() {
  it('has correct preload batch size defaults', function() {
    const infinite = mount(
      <Infinite
        elementHeight={200}
        containerHeight={800}
        className={'correct-class-name'}
      >
        <div />
        <div />
      </Infinite>
    );

    expect(infinite.instance().computedProps.preloadBatchSize).toEqual(400);
  });

  it('can use a number to set preload batch size', function() {
    const infinite = mount(
      <Infinite
        elementHeight={200}
        containerHeight={800}
        preloadBatchSize={742}
        className={'correct-class-name'}
      >
        <div />
        <div />
      </Infinite>
    );

    expect(infinite.instance().computedProps.preloadBatchSize).toEqual(742);
  });

  it('can be used with a preload batch size scale factor', function() {
    const infinite = mount(
      <Infinite
        elementHeight={200}
        containerHeight={800}
        preloadBatchSize={Infinite.containerHeightScaleFactor(4)}
        className={'correct-class-name'}
      >
        <div />
        <div />
      </Infinite>
    );

    expect(infinite.instance().computedProps.preloadBatchSize).toEqual(3200);
  });

  it('has correct preload additional height defaults', function() {
    const infinite = mount(
      <Infinite
        elementHeight={200}
        containerHeight={800}
        className={'correct-class-name'}
      >
        <div />
        <div />
      </Infinite>
    );

    expect(infinite.instance().computedProps.preloadAdditionalHeight).toEqual(
      800
    );
  });

  it('can use a number to set preload additional height', function() {
    const infinite = mount(
      <Infinite
        elementHeight={200}
        containerHeight={200}
        preloadAdditionalHeight={465}
        className={'correct-class-name'}
      >
        <div />
        <div />
      </Infinite>
    );

    expect(infinite.instance().computedProps.preloadAdditionalHeight).toEqual(
      465
    );
  });

  it('can be used with a preload additional height scale factor', function() {
    const infinite = mount(
      <Infinite
        elementHeight={200}
        containerHeight={500}
        preloadAdditionalHeight={Infinite.containerHeightScaleFactor(1.5)}
        className={'correct-class-name'}
      >
        <div />
        <div />
      </Infinite>
    );

    expect(infinite.instance().computedProps.preloadAdditionalHeight).toEqual(
      750
    );
  });
});

describe('Rerendering React Infinite', function() {
  it('updates the infinite computer', function() {
    var rootNode = mount(
      <Infinite
        elementHeight={17}
        containerHeight={450}
        infiniteLoadBeginEdgeOffset={1000}
        loadingSpinnerDelegate={<div className={'delegate-div'} />}
        className={'correct-class-name'}
      >
        {renderHelpers.divGenerator(20, 17)}
      </Infinite>
    );

    expect(rootNode.state().infiniteComputer.heightData).toEqual(17);
    expect(rootNode.state().infiniteComputer.numberOfChildren).toEqual(20);

    rootNode = mount(
      <Infinite
        elementHeight={17}
        containerHeight={450}
        infiniteLoadBeginEdgeOffset={1000}
        loadingSpinnerDelegate={<div className={'delegate-div'} />}
        className={'correct-class-name'}
      >
        {renderHelpers.divGenerator(74, 17)}
      </Infinite>
    );
    expect(rootNode.state().infiniteComputer.numberOfChildren).toEqual(74);

    rootNode = mount(
      <Infinite
        elementHeight={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120]}
        containerHeight={450}
        infiniteLoadBeginEdgeOffset={1000}
        loadingSpinnerDelegate={<div className={'delegate-div'} />}
        className={'correct-class-name'}
      >
        {renderHelpers.divGenerator(12, 17)}
      </Infinite>
    );
    expect(rootNode.state().infiniteComputer.heightData).toEqual([
      10,
      20,
      30,
      40,
      50,
      60,
      70,
      80,
      90,
      100,
      110,
      120
    ]);
  });
});

describe('Requesting all visible rows', function() {
  const InfiniteWrapper = createReactClass({
    getInitialState() {
      return { currentRows: 0, totalRequests: 0 };
    },

    onInfiniteLoad() {
      this.setState({
        totalRequests: this.state.totalRequests + 1
      });

      if (this.state.currentRows < this.props.totalRows) {
        this.setState({
          currentRows: this.state.currentRows + 1
        });
      }
    },

    render() {
      return (
        <Infinite
          elementHeight={this.props.elementHeight}
          containerHeight={this.props.containerHeight}
          onInfiniteLoad={this.onInfiniteLoad}
          infiniteLoadBeginEdgeOffset={100}
          className={'correct-class-name'}
        >
          {renderHelpers.divGenerator(
            this.state.currentRows,
            this.props.elementHeight
          )}
        </Infinite>
      );
    }
  });

  it('will request all possible rows until the scroll height is met', function() {
    const rootNode = mount(
      <InfiniteWrapper
        totalRows={50}
        elementHeight={40}
        containerHeight={400}
      />
    );

    expect(rootNode.state().totalRequests).toEqual(10);
    expect(rootNode.state().currentRows).toEqual(10);
  });

  it('will stop requesting when no further rows are provided', function() {
    const rootNode = mount(
      <InfiniteWrapper totalRows={3} elementHeight={40} containerHeight={400} />
    );

    expect(rootNode.state().totalRequests).toEqual(4);
    expect(rootNode.state().currentRows).toEqual(3);
  });

  it('will work when no possible rows can be loaded', function() {
    const rootNode = mount(
      <InfiniteWrapper totalRows={0} elementHeight={40} containerHeight={400} />
    );

    expect(rootNode.state().totalRequests).toEqual(1);
    expect(rootNode.state().currentRows).toEqual(0);
  });
});
