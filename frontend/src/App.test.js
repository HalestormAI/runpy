import React from 'react';
import {shallow, mount} from 'enzyme';
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk';
import App from "./App";

const mockStore = configureMockStore([thunk]);

jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
    useDispatch: () => jest.fn()
}));
//
// jest.mock('./components/ui/themeSlice', () => ({
//     selectDarkMode: x => (x),
//     selectDmMediaQueryState: x => x,
//     updateMediaQueryState: () => {}
// }));

import {useDispatch, useSelector} from "react-redux";

const mockAppState = {
    uiTheme: {
        darkMode: {
            mediaQueryResult: null,
            localPref: null
        }
    }
};

describe('top level application functionality', () => {
    beforeEach(() => {
        useSelector.mockImplementation(callback => {
            return callback(mockAppState);
        });
    });
    afterEach(() => {
        useSelector.mockClear();
    });
    it('renders without crashing', () => {
        shallow(<App/>);
    });

    it('rendered the page correctly for dark mode (media query)', () => {
        const darkModeState = {
            ...mockAppState
        }
        mockAppState.uiTheme.darkMode.mediaQueryResult = true;
        mockAppState.uiTheme.darkMode.localPref = null;
        const wrapper = shallow(<App/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('rendered the page correctly for dark mode (user pref)', () => {
        const darkModeState = {
            ...mockAppState
        }
        mockAppState.uiTheme.darkMode.mediaQueryResult = false;
        mockAppState.uiTheme.darkMode.localPref = true;
        const wrapper = shallow(<App/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('rendered the page correctly for light mode (media query)', () => {
        const darkModeState = {
            ...mockAppState
        }
        mockAppState.uiTheme.darkMode.mediaQueryResult = false;
        mockAppState.uiTheme.darkMode.localPref = null;
        const wrapper = shallow(<App/>);
        expect(wrapper).toMatchSnapshot();
    });

    it('rendered the page correctly for light mode (user pref)', () => {
        const darkModeState = {
            ...mockAppState
        }
        mockAppState.uiTheme.darkMode.mediaQueryResult = true;
        mockAppState.uiTheme.darkMode.localPref = false;
        const wrapper = shallow(<App/>);
        expect(wrapper).toMatchSnapshot();
    });
});


