React Infinite
===
[![Build Status](https://travis-ci.org/seatgeek/react-infinite.svg?branch=master)](https://travis-ci.org/seatgeek/react-infinite.svg)

**A browser-ready efficient scrolling container based on UITableView**

In the browser, when a long list of DOM elements are placed in a scrollable container, all of them are kept in the DOM tree even when they are scrolled out the user's view. This is highly inefficient, especially in cases when scrolling lists can be tens or hundreds of thousands of items long; the number of additional nodes may well reach the millions.

React Infinite solves this with some inspiration from iOS's UITableView and AirBnB's Infinity.js. In sum, DOM nodes that are not visible to the user at the top and the bottom of the container are rendered as a single blank node that takes up the space those nodes would otherwise have taken up. With React, this becomes even easier. Its virtual DOM allows the same set of nodes to be reused; only their content is changed.

React Infinite is ready for use with both browsers and Node.js. Its only dependency is React, and minified and development versions are available to be dropped in.

SeatGeek currently uses React Infinite in production on our event pages; because we only have pages for events in the future, a link would not be appropriate. To see one, head to one of our team pages for the [New York Giants](https://seatgeek.com/new-york-giants-tickets), or the [New York Mets](https://seatgeek.com/new-york-mets-tickets), or the [New York Knicks](https://seatgeek.com/new-york-knicks-tickets), and click on the green button for an event to see them in action in the Omnibox.

![](http://cl.ly/image/0y0L04220U2T/Screen%20Shot%202014-10-16%20at%2010.56.19%20AM.png)

## Basic Use

React Infinite **only requires React (addons are not required)** and currently supports displaying a container with numerous rows of items of equal height. Each row should also take up the full width of the container. It also supports downwards infinite scrolling; it will display an infinite loading spinner at the bottom.

### Installing
React Infinite uses a Universal Module Definition so it can be used in Node or in the browser. Concatenating it or importing it in the browser produces the global variable `Infinite`, while you can use it in Node (or Browserify) by calling `require('react-infinite')`.

To use React Infinite, call it with a list of children that should be rendered by the component:

```xml
<Infinite containerHeight={200} elementHeight={40}>
    <div className="one"/>
    <div className="two"/>
    <div className="three"/>
</Infinite>
```

## Smooth Scrolling
Some browsers do not take kindly to our manipulation of scroll views. This causes janky scrolling behavior. To counter this, I've taken inspiration from [this article](http://www.thecssninja.com/css/pointer-events-60fps) that encourages the use of `pointer-events: none`. A wrapper `div` is now applied that disables pointer events on the children for a default 150 milliseconds after the last user scroll action.

To configure the amount of time that we consider the parent container to be scrolling after the last scroll event has been fired, set `timeScrollStateLastsForAfterUserScrolls` to the desired time in milliseconds.


## Configuration Options

#### Children
The children of the `<Infinite>` element are the components you want to render. This gives you as much flexibility as you need in the presentation of those components. Each child can be a different component if you desire. When rendering children, the `<Infinite>` element passes down a `style` prop to each child containing `pointer-events: none` if the `<Infinite>` element is scrolling. You can apply that style prop to your component to prevent it from receiving pointer events.

#### (Required) Number `elementHeight`
The height of each row in pixels.

#### (Required) **Number** `containerHeight`
The height of the scrolling container in pixels.

#### Number `preloadBatchSize`
Defaults to `this.props.containerHeight / 2`. Imagine the total height of the scrollable divs. Now divide this equally into blocks `preloadBatchSize` pixels high. Every time the container's scrollTop enters each of these blocks the set of elements rendered in full are those contained within the block and elements that are within `preloadAdditionalHeight` above and below it.

#### Number `preloadAdditionalHeight`
Defaults to `this.props.containerHeight`. The total height of the area in which elements are rendered in full is height of the current scroll block (see `preloadBatchSize`) as well as `preloadAdditionalHeight` above and below it.

#### **Function** `handleScroll(DOMNode node)`
Defaults to `function(){}`. A function that is called when the container is scrolled, i.e. when the `onScroll` event of the infinite scrolling container is fired. The only argument passed to it is the native DOM [Node](https://developer.mozilla.org/en-US/docs/Web/API/Node) of the scrolling container.

#### **Number** `infiniteLoadBeginBottomOffset`
When the user reaches this number of pixels from the bottom, the infinite load sequence will be triggered by showing the infinite load spinner delegate and calling the function `onInfiniteLoad`. To disable infinite loading, do not provide this property.

#### Function `onInfiniteLoad()`
Defaults to `function(){}`. This function is called when the scroll exceeds `infiniteLoadBeginBottomOffset`. Before this function is called, **the infinite loading spinner is automatically turned on**. You can set up infinite scrolling with this function like this:

1. Fetch a new page of records from the appropriate API
2. When the AJAX call returns, send the new list of elements (with the items that were just fetched) back as the children of React Infinite.
3. Set React Infinite's `isInfiniteLoading` prop to `false` to hide the loading spinner display

`onInfiniteLoad` relies heavily on passing props as a means of communication in the style of idiomatic React.

#### Renderable `loadingSpinnerDelegate`
Defaults to `<div/>`. The element that is provided is used to render the loading view when React Infinite's `isInfiniteLoading` property is set to `true`.

#### Bool `isInfiniteLoading`
Defaults to `false`. This property determines whether the infinite spinner is showing.

#### Number `timeScrollStateLastsForAfterUserScrolls`
Defaults to `150` (in milliseconds). On Apple and some other devices, scroll is inertial. This means that the window continues to scroll for several hundred milliseconds after an `onScroll` event is fired. To prevent janky behavior, we do not want `pointer-events` to reactivate before the window has finished moving. Setting this parameter causes the `Infinite` component to think that the user is still scrolling for the specified number of milliseconds after the last `onScroll` event is received.

#### String `className`
Allows a CSS class to be set on the scrollable container.

## Sample Code
To get you started, here is some sample code that implements an infinite scroll with an simulated delay of 2.5 seconds. A [live demo of this example is available](http://chairnerd.seatgeek.com/react-infinite-a-browser-ready-efficient-scrolling-container-based-on-uitableview/) on our blog.

```javascript
var ListItem = React.createClass({
    render: function() {
        return <div className="infinite-list-item">
        List Item {this.props.key}
        </div>;
    }
});

var InfiniteList = React.createClass({
    getInitialState: function() {
        return {
            elements: this.buildElements(0, 20),
            isInfiniteLoading: false
        }
    },

    buildElements: function(start, end) {
        var elements = [];
        for (var i = start; i < end; i++) {
            elements.push(<ListItem key={i}/>)
        }
        return elements;
    },

    handleInfiniteLoad: function() {
        var that = this;
        this.setState({
            isInfiniteLoading: true
        });
        setTimeout(function() {
            var elemLength = that.state.elements.length,
                newElements = that.buildElements(elemLength, elemLength + 1000);
            that.setState({
                isInfiniteLoading: false,
                elements: that.state.elements.concat(newElements)
            });
        }, 2500);
    },

    elementInfiniteLoad: function() {
        return <div className="infinite-list-item">
            Loading...
        </div>;
    },

    render: function() {
        return <Infinite elementHeight={40}
                         containerHeight={250}
                         infiniteLoadBeginBottomOffset={200}
                         onInfiniteLoad={this.handleInfiniteLoad}
                         loadingSpinnerDelegate={this.elementInfiniteLoad()}
                         isInfiniteLoading={this.state.isInfiniteLoading}
                         >
            {this.state.elements}
        </Infinite>;
    }
});

React.renderComponent(<InfiniteList/>,
        document.getElementById('react-example-one'));
```

## Infinite Jest
I am seated in an office, surrounded by heads and bodies. There I've written some tests for this package, using Facebook's Jest library<small><sup>1</sup></small>, which provides automatic mocking and jsdom testing.

Tests are located in the `__tests__` directory<small><sup>2</sup></small>, and can be run with `npm test` after `npm install`.

## Developing
React Infinite is built with Gulp. To get started, install the development dependencies with `npm install`. If you do not already have Gulp, you might wish to install it globally with `npm install -g gulp`. Then run `gulp`, which builds both the production and development versions. To build just the former, run `gulp buildp`, and to build just the latter, run `gulp build`.

## Future Development

It would be useful for React Infinite to be adapted to any arbitrary two-dimensional grid.

<small><sup>1</sup></small> In sum, Jest is a library that provides several layers on top of Jasmine. More information can be found on Facebook's [Jest page](https://facebook.github.io/jest/).

<small><sup>2</sup></small> The directory name is specified by Jest. Tests can be written in JSX because they are first run through a preprocessor that compiles them to plain Javascript.
