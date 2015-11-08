jest.dontMock('../src/react-infinite.jsx');
jest.dontMock('../src/computers/infiniteComputer.js');
jest.dontMock('../src/computers/constantInfiniteComputer.js');
jest.dontMock('../src/computers/arrayInfiniteComputer.js');
jest.dontMock('../src/utils/binaryIndexSearch.js');
jest.dontMock('../src/utils/infiniteHelpers.js');
jest.dontMock('lodash.isfinite');
jest.dontMock('lodash.isarray');

var React = require('react/addons');
var TestUtils = React.addons.TestUtils;
var Infinite = require('../src/react-infinite.jsx');

var renderHelpers = require('./helpers/renderHelpers');

