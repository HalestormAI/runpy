import React from "react";
import StravaSearchComponent, {formIsValid, SearchFormComponent, useStyles} from "../index";
import {mount, shallow} from "enzyme";
import {initialState as uiInitialState, selectFormState} from "../searchUiSlice";
import {performSearch, selectApiState} from "../searchApiSlice";
import {useDispatch, useSelector} from "react-redux";
import {randomString} from "../../../test-utils";
import DistanceSearchFields from "../filterTypes/searchTypeDistance";
import {CircularProgress} from "@material-ui/core";

jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
    useDispatch: jest.fn()
}));


jest.mock('../searchApiSlice', () => {
    // Works and lets you check for constructor calls:
    return {
        performSearch: jest.fn().mockImplementation(() => {
            return "performSearchOutput"
        }),
    };
});

const {initialState} = jest.requireActual('../searchApiSlice');

describe("strava search component", () => {

    let mockAppStates = null;

    beforeEach(() => {
        useSelector.mockImplementation(callback => {
            return mockAppStates[callback];
        });

        mockAppStates = {
            [selectFormState]: {
                ...uiInitialState
            },
            [selectApiState]: {
                ...initialState.data
            }
        }
    });

    describe("rendering", () => {

        it("should render without crashing", () => {
            mount(<StravaSearchComponent/>);
        });

        it("should not show a form when the type is not distance", () => {
            mockAppStates[selectFormState].type = randomString();
            const wrapper = shallow(<StravaSearchComponent/>);
            const components = wrapper.find(SearchFormComponent);
            expect(components).toHaveLength(0);
        });

        it("should display the distance search fields component when type is distance", () => {
            const wrapper = shallow(<StravaSearchComponent/>);
            const components = wrapper.find(SearchFormComponent);
            expect(components).toHaveLength(1);
            expect(components.at(0).shallow().find(DistanceSearchFields))
                .toHaveLength(1);
        });

        it("should set the button to enabled and not display a spinner when not waiting", () => {
            mockAppStates[selectApiState].waiting = false;
            const wrapper = mount(<StravaSearchComponent/>);

            const buttons = wrapper.find('button.search-button')
            expect(buttons).toHaveLength(1);
            expect(buttons.at(0).prop("disabled")).toBeFalsy();

            expect(wrapper.find(CircularProgress)).toHaveLength(0);
        });

        it("should set the button to disabled and display a spinner when waiting", () => {
            mockAppStates[selectApiState].waiting = true;
            const wrapper = mount(<StravaSearchComponent/>);

            const buttons = wrapper.find('button.search-button')
            expect(buttons).toHaveLength(1);
            expect(buttons.at(0).prop("disabled")).toBeTruthy();

            expect(wrapper.find(CircularProgress)).toHaveLength(1);
        });
    });

    describe("handlers", () => {
        let mockDispatchFn;

        beforeEach(() => {
            mockDispatchFn = jest.fn(() => {
            });
            useDispatch.mockImplementation(() => mockDispatchFn);
        });

        it("should dispatch a search when a valid form is submitted", () => {
            const mockValidState = {field: true};
            const useStateMock = initialState => [mockValidState, () => {
            }];
            jest.spyOn(React, 'useState').mockImplementation(useStateMock);

            const wrapper = shallow(<StravaSearchComponent/>);
            const form = wrapper.find('form');

            const prevDefMock = jest.fn();
            form.simulate('submit', {preventDefault: prevDefMock});
            expect(mockDispatchFn).toHaveBeenCalledTimes(1);
            expect(mockDispatchFn).toHaveBeenCalledWith(performSearch());
        });

        it("should not dispatch a search when an invalid form is submitted", () => {
            const mockValidState = {field: false};
            const useStateMock = initialState => [mockValidState, () => {
            }];
            jest.spyOn(React, 'useState').mockImplementation(useStateMock);

            const wrapper = shallow(<StravaSearchComponent/>);
            const form = wrapper.find('form');

            const prevDefMock = jest.fn();
            form.simulate('submit', {preventDefault: prevDefMock});
            expect(mockDispatchFn).toHaveBeenCalledTimes(0);
        });
    });

    describe("helpers", () => {
        it("it should return true if all fields are valid", () => {
            const stateAllValid = {
                field1: true,
                field2: true,
                field3: true,
                field4: true
            };

            expect(formIsValid(stateAllValid)).toBeTruthy();
        });

        it("it should false true if any fields are invalid", () => {
            const stateAllValid = {
                field1: true,
                field2: true,
                field3: false,
                field4: true
            };

            expect(formIsValid(stateAllValid)).toBeFalsy();
        });
    })
});
