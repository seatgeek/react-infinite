jest.dontMock('../dist/react-infinite.js');

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var Infinite = require('../dist/react-infinite.js');

var renderHelpers = {
  divGenerator: function(number, height) {
    number = number || 10;
    height = height || 100;

    var divArray = [];
    for (var i = 0; i < number; i++) {
      divArray.push(<div className={"test-div-" + i} key={i} style={{height: height}}/>)
    }

    return divArray;
  }
}

describe('Rendering the React Infinite Component Wrapper', function() {
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

  it('renders itself into the DOM with the correct container styles', function() {
    var infinite = TestUtils.renderIntoDocument(
        <Infinite elementHeight={200}
                  containerHeight={800}
                  className={"root-scrollable-node"}>
          <div/>
          <div/>
        </Infinite>
      );

    var rootScrollable = TestUtils.findRenderedDOMComponentWithClass(infinite, 'root-scrollable-node')
    expect(rootScrollable.props.style.height).toEqual(800);
    expect(rootScrollable.props.style.overflowX).toEqual('hidden');
    expect(rootScrollable.props.style.overflowY).toEqual('scroll');
  });

  it('applies the provided class name to the root node', function() {
    var infinite = TestUtils.renderIntoDocument(
        <Infinite elementHeight={200}
                  containerHeight={800}
                  className={"correct-class-name"}>
          <div/>
          <div/>
        </Infinite>
      );

    expect(infinite.props.className).toEqual("correct-class-name");
  });
})

describe('The Children of the React Infinite Component', function() {
  it ("renders its children when no hiding behavior is required", function() {
    var infinite = TestUtils.renderIntoDocument(
        <Infinite elementHeight={200}
                  containerHeight={800}
                  className={"correct-class-name"}>
          <div className={"test-div-0"}/>
          <div className={"test-div-1"}/>
        </Infinite>
      );

    expect(TestUtils.findRenderedDOMComponentWithClass(infinite, 'test-div-0')).not.toBeUndefined();
    expect(TestUtils.findRenderedDOMComponentWithClass(infinite, 'test-div-1')).not.toBeUndefined();
  });

  it ("renders its children when some DOM nodes are hidden", function() {
    var elementHeight = 200;
    var infinite = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(10, elementHeight)}
        </Infinite>
      );

    // Why are six nodes rendered? Since we have not scrolled at
    // all, the extent that React Infinite will render is
    // preloadBatchSize + preloadAdditionalHeight below the container.
    //
    // preloadBatchSize defaults to the containerHeight, 800 pixels
    // preloadAdditionalHeight defaults to containerHeight / 2 pixels, 400 pixels
    //
    // Their sum is 1200 pixels, or 6 200-pixel elements.
    for (var i = 0; i < 6; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(infinite, 'test-div-' + i)
      }).not.toThrow();
    }

    for (var i = 6; i < 10; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(infinite, 'test-div-' + i)
      }).toThrow();
    }
  });

  it ("renders more children when preloadAdditionalHeight is increased beyond its default", function() {
    var elementHeight = 200;
    var infinite = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  preloadAdditionalHeight={1000}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(10, elementHeight)}
        </Infinite>
      );

    // Why are six nodes rendered? Since we have not scrolled at
    // all, the extent that React Infinite will render is
    // preloadBatchSize + preloadAdditionalHeight below the container.
    //
    // preloadBatchSize defaults to the containerHeight, 800 pixels
    // preloadAdditionalHeight defaults to containerHeight / 2 pixels, 400 pixels
    //
    // Their sum is 1200 pixels, or 6 200-pixel elements.
    for (var i = 0; i < 7; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(infinite, 'test-div-' + i)
      }).not.toThrow();
    }

    for (var i = 7; i < 10; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(infinite, 'test-div-' + i)
      }).toThrow();
    }
  });

  it ("renders more children when preloadBatchSize is increased beyond its default", function() {
    var elementHeight = 200;
    var infinite = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  preloadBatchSize={800}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(10, elementHeight)}
        </Infinite>
      );

    // Why are six nodes rendered? Since we have not scrolled at
    // all, the extent that React Infinite will render is
    // preloadBatchSize + preloadAdditionalHeight below the container.
    //
    // preloadBatchSize defaults to the containerHeight, 800 pixels
    // preloadAdditionalHeight defaults to containerHeight / 2 pixels, 400 pixels
    //
    // Their sum is 1200 pixels, or 6 200-pixel elements.
    for (var i = 0; i < 8; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(infinite, 'test-div-' + i)
      }).not.toThrow();
    }

    for (var i = 8; i < 10; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(infinite, 'test-div-' + i)
      }).toThrow();
    }
  });
})

describe('The Scrolling Behavior of the React Infinite Component', function() {
  it('hides visible elements when the user scrolls sufficiently', function() {
    var elementHeight = 200;
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(20, elementHeight)}
        </Infinite>
      );

    TestUtils.Simulate.scroll(rootNode.getDOMNode(), {
      target: {
        scrollTop: 1500
      }
    });

    // Schematic
    //   600 pixels: start of preloadAdditionalHeight above batch of 800 pixels
    //   1400 pixels: start of batch that the scrollTop of 1500 pixels is in
    //   1500 pixels: scrollTop of React Infinite container
    //   1800 pixels: end of batch
    //   2300 pixels: end of React Infinite container
    //   2600 pixels: end of preloadAdditionalHeight above batch of 800 pixels

    // Above the batch and its preloadAdditionalHeight
    for (var i = 0; i < 2; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-' + i)
      }).toThrow();
    }

    // Within the batch and its preloadAdditionalHeight, top and bottom
    for (var i = 2; i < 12; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-' + i)
      }).not.toThrow();
    }

    // Below the batch and its preloadAdditionalHeight
    for (var i = 12; i < 20; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-' + i)
      }).toThrow();
    }
  });

  it("functions correctly at the end of its range", function() {
    var elementHeight = 200;
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(20, elementHeight)}
        </Infinite>
      );

    // The total scrollable height here is 4000 pixels
    TestUtils.Simulate.scroll(rootNode.getDOMNode(), {
      target: {
        scrollTop: 3600
      }
    });

    // Above the batch and its preloadAdditionalHeight
    for (var i = 0; i < 14; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-' + i)
      }).toThrow();
    }

    // Within the batch and its preloadAdditionalHeight, top and bottom
    for (var i = 14; i < 20; i++) {
      expect(function() {
        TestUtils.findRenderedDOMComponentWithClass(rootNode, 'test-div-' + i)
      }).not.toThrow();
    }
  })
});

describe("React Infinite's Infinite Scroll Capabilities", function() {

  it("infiniteLoadBeginBottomOffset does not always trigger infinite load on scroll", function() {
    var infiniteSpy = jasmine.createSpy('infiniteSpy');
    var elementHeight = 200;
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  onInfiniteLoad={infiniteSpy}
                  infiniteLoadBeginBottomOffset={1000}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(20, elementHeight)}
        </Infinite>
      );

    TestUtils.Simulate.scroll(rootNode.getDOMNode(), {
      target: {
        scrollTop: 300 // past the bottom offset
      }
    });

    expect(infiniteSpy).not.toHaveBeenCalled();
  });

  it("triggers the onInfiniteLoad function when scrolling past infiniteLoadBeginBottomOffset", function() {
    var infiniteSpy = jasmine.createSpy('infiniteSpy');
    var elementHeight = 200;
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  onInfiniteLoad={infiniteSpy}
                  infiniteLoadBeginBottomOffset={1000}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(20, elementHeight)}
        </Infinite>
      );

    TestUtils.Simulate.scroll(rootNode.getDOMNode(), {
      target: {
        scrollTop: 3600 // past the bottom offset
      }
    });

    expect(infiniteSpy).toHaveBeenCalled();
  });

  it("does not always display the loadingSpinnerDelegate", function() {
    var infiniteSpy = jasmine.createSpy('infiniteSpy');
    var elementHeight = 200;
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  onInfiniteLoad={infiniteSpy}
                  infiniteLoadBeginBottomOffset={1000}
                  loadingSpinnerDelegate={<div className={"delegate-div"} />}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(20, elementHeight)}
        </Infinite>
      );

    TestUtils.Simulate.scroll(rootNode.getDOMNode(), {
      target: {
        scrollTop: 100 // past the bottom offset
      }
    });

    expect(function() {
      TestUtils.findRenderedDOMComponentWithClass(rootNode, 'delegate-div')
    }).toThrow();
  });

  it("displays the loadingSpinnerDelegate when isInfiniteLoading", function() {
    var infiniteSpy = jasmine.createSpy('infiniteSpy');
    var elementHeight = 200;
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  onInfiniteLoad={infiniteSpy}
                  infiniteLoadBeginBottomOffset={1000}
                  loadingSpinnerDelegate={<div className={"delegate-div"} />}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(20, elementHeight)}
        </Infinite>
      );

    TestUtils.Simulate.scroll(rootNode.getDOMNode(), {
      target: {
        scrollTop: 3600 // past the bottom offset
      }
    });

    expect(function() {
      TestUtils.findRenderedDOMComponentWithClass(rootNode, 'delegate-div')
    }).not.toThrow();
  });
});

describe("Maintaining React Infinite's internal scroll state", function() {
  it("has does not have pointer-events: none by default", function() {
    var infiniteSpy = jasmine.createSpy('infiniteSpy');
    var elementHeight = 200;
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  timeScrollStateLastsForAfterUserScrolls={10000}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(20, elementHeight)}
        </Infinite>
      );
  var wrapper = rootNode.refs.smoothScrollingWrapper;
  expect(wrapper.props.style.pointerEvents).toBeUndefined();
  });

  it("has pointer-events: none upon scroll", function() {
    var infiniteSpy = jasmine.createSpy('infiniteSpy');
    var elementHeight = 200;
    var rootNode = TestUtils.renderIntoDocument(
        <Infinite elementHeight={elementHeight}
                  containerHeight={800}
                  timeScrollStateLastsForAfterUserScrolls={10000}
                  className={"correct-class-name"}>
          {renderHelpers.divGenerator(20, elementHeight)}
        </Infinite>
      );

  TestUtils.Simulate.scroll(rootNode.getDOMNode(), {
    target: {
      scrollTop: 100 // past the bottom offset
    }
  });

  var wrapper = rootNode.refs.smoothScrollingWrapper;
  expect(wrapper.props.style.pointerEvents).toEqual('none');
  });
})
