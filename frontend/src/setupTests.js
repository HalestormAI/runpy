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

// https://stackoverflow.com/questions/57001262/jest-expect-only-unique-elements-in-an-array
expect.extend({
    toBeDistinct(received) {
        // for efficiency, we'll perform a set check first which will catch non-unique literals
        let allUnique = Array.isArray(received) && new Set(received).size === received.length;

        if (allUnique) {
            // Might still not be the case since set uses a shallow equality
            // This is not a cheap operation, so we'll only do it when necessary
            // https://stackoverflow.com/a/49050668/168735
            const deepSet = a => [...new Set(a.map(o => JSON.stringify(o)))].map(s => JSON.parse(s));
            allUnique &= Array.isArray(received) && deepSet(received).length === received.length
        }

        if (allUnique) {
            return {
                message: () => `[${received}] array contains only distinct values`,
                pass: true,
            };
        } else {
            return {
                message: () => `expected [${received}] array to contain distinct values`,
                pass: false,
            };
        }
    },
});
