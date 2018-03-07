import Enzyme from 'enzyme';
import React16Adapter from 'enzyme-adapter-react-16';

Enzyme.configure({ adapter: new React16Adapter() });