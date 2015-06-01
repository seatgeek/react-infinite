React Infinite
===
[![Build Status](https://travis-ci.org/seatgeek/react-infinite.svg?branch=master)](https://travis-ci.org/seatgeek/react-infinite)
[![Coverage Status](https://coveralls.io/repos/seatgeek/react-infinite/badge.svg)](https://coveralls.io/r/seatgeek/react-infinite)

**A browser-ready efficient scrolling container based on UITableView. Now supports elements of variable heights!**

In the browser, when a long list of DOM elements are placed in a scrollable container, all of them are kept in the DOM even when they are scrolled out the user's view. This is highly inefficient, especially in cases when scrolling lists can be tens or hundreds of thousands of items long; the number of additional nodes may well reach the millions.

React Infinite solves this with some inspiration from iOS's UITableView and AirBnB's Infinity.js by rendering only DOM nodes that the user is able to see or might soon see. Other DOM nodes are clustered and rendered as a single blank node.

## Installation

### In the Browser
The relevant files are `dist/react-infinite.js` and `dist/react-infinite.min.js`. You **must** have React available as a global variable named `React` on the `window`. Including either file, through concatenation or a script tag, will produce a global variable named **`Infinite`** representing the component.

### In NPM
React Infinite uses a Universal Module Definition so you can use it in NPM as well. `npm install` this package and
```
var Infinite = require('react-infinite');
```

### In Browserify
If you want to use the source with Browserify, you may require it in a similar manner to the NPM instructions above. You **must** have Reactify to compile the JSX and ES6, however.

Otherwise, you can follow the instructions for NPM.

## Basic Use
### Elements of Equal Height
To use React Infinite with a list of elements you want to make scrollable, provide them to React Infinite as children.

```xml
<Infinite containerHeight={200} elementHeight={40}>
    <div className="one"/>
    <div className="two"/>
    <div className="three"/>
</Infinite>
```

### Elements of Varying Heights
If not all of the children have the same height, you must provide an array of integers to the `elementHeight` prop instead.
```xml
<Infinite containerHeight={200} elementHeight={[111, 252, 143]}>
    <div className="111-px"/>
    <div className="252-px"/>
    <div className="143-px"/>
</Infinite>
```

### Note on Smooth Scrolling
A wrapper `div` is applied that disables pointer events on the children for a default of 150 milliseconds after the last user scroll action for browsers with inertial scrolling. To configure this, set `timeScrollStateLastsForAfterUserScrolls`.


## Configuration Options

#### Children
The children of the `<Infinite>` element are the components you want to render. This gives you as much flexibility as you need in the presentation of those components. Each child can be a different component if you desire. If you wish to render a set of children not all of which have the same height, you must map each component in the children array to an number representing its height and pass it in as the `elementHeight` prop.

#### (Required) Number | [Number] `elementHeight`
If each child element has the same height, you can pass a number representing that height as the `elementHeight` prop. If the children do not all have the same height, you can pass an array which is a map the children to numbers representing their heights to the `elementHeight` prop.

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

#### React Node `loadingSpinnerDelegate`
Defaults to `<div/>`. The element that is provided is used to render the loading view when React Infinite's `isInfiniteLoading` property is set to `true`. A React Node is anything that satisfies `React.PropTypes.node`.

#### Bool `isInfiniteLoading`
Defaults to `false`. This property determines whether the infinite spinner is showing.

#### Number `timeScrollStateLastsForAfterUserScrolls`
Defaults to `150` (in milliseconds). On Apple and some other devices, scroll is inertial. This means that the window continues to scroll for several hundred milliseconds after an `onScroll` event is fired. To prevent janky behavior, we do not want `pointer-events` to reactivate before the window has finished moving. Setting this parameter causes the `Infinite` component to think that the user is still scrolling for the specified number of milliseconds after the last `onScroll` event is received.

#### String `className`
Allows a CSS class to be set on the scrollable container.

## Sample Code

Code samples are now available in the `/examples` directory for your perusal. Two examples are provided, one for constant height with infinite loading and another with random variable heights with infinite loading. To generate the files necessary for the examples, execute `npm install && gulp build -E`. You may need to first install `gulp` with `npm install -g gulp`.

To get you started, here is some sample code that implements an infinite scroll with an simulated delay of 2.5 seconds. A [live demo of this example is available](http://chairnerd.seatgeek.com/react-infinite-a-browser-ready-efficient-scrolling-container-based-on-uitableview/) on our blog.

```javascript
var ListItem = React.createClass({
    render: function() {
        return <div className="infinite-list-item">
        List Item {this.props.num}
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
            elements.push(<ListItem key={i} num={i}/>)
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

React.render(<InfiniteList/>, document.getElementById('react-example-one'));
```

SeatGeek also currently uses React Infinite in production on our event pages; because we only have pages for events in the future, a link would not be appropriate. To see one, head to one of our team pages for the [New York Giants](https://seatgeek.com/new-york-giants-tickets), or the [New York Mets](https://seatgeek.com/new-york-mets-tickets), or the [New York Knicks](https://seatgeek.com/new-york-knicks-tickets), and click on the green button for an event to see them in action in the Omnibox.

![](http://cl.ly/image/0y0L04220U2T/Screen%20Shot%202014-10-16%20at%2010.56.19%20AM.png)

## Infinite Jest
I am seated in an office, surrounded by heads and bodies. There I've written some tests for this package, using Facebook's Jest library<small><sup>1</sup></small>, which provides automatic mocking and jsdom testing.

Tests are located in the `__tests__` directory<small><sup>2</sup></small>, and can be run with `npm test` after `npm install`.

## Developing
React Infinite is built with Browserify and Gulp. To get started, install the development dependencies with `npm install`. If you do not already have Gulp, you might wish to install it globally with `npm install -g gulp`. Then run `gulp build -D`, which builds the development version. To build the production version, run `gulp build -P`, and to build the non-minified release version, run `gulp`.

### Infinite Computers

Extending React Infinite to support different specifications of `elementHeight`s is now much easier. To do so, write a class that extends the `InfiniteComputer` and satisfies its interface of five methods (see `src/computers/infinite_computer.js`). You can consult `ConstantInfiniteComputer` and `ArrayInfiniteComputer` to see how constant and variable heights are handled respectively.

## Future Development

It would be useful for React Infinite to be adapted to any arbitrary two-dimensional grid.

<small><sup>1</sup></small> In sum, Jest is a library that provides several layers on top of Jasmine. More information can be found on Facebook's [Jest page](https://facebook.github.io/jest/).

<small><sup>2</sup></small> The directory name is specified by Jest. Tests can be written in JSX because they are first run through a preprocessor that compiles them to plain Javascript.
