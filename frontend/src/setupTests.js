// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';

import 'jest-canvas-mock';
import Enzyme from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import 'jest-enzyme';
import 'jest-localstorage-mock';
import {enableFetchMocks} from 'jest-fetch-mock'

enableFetchMocks()

window.URL.createObjectURL = function () {
};

Enzyme.configure({adapter: new Adapter()});


