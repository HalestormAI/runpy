import React from "react";
import DistanceSearchFields from "../searchTypeDistance";
import {mount} from "enzyme";
import {useDispatch, useSelector} from "react-redux";
import {updateLow} from "../../searchUiSlice";
import {TextField} from "@material-ui/core";

jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
    useDispatch: jest.fn(),
}));

jest.mock('../../searchUiSlice', () => {
    // Works and lets you check for constructor calls:
    return {
        updateHigh: jest.fn().mockImplementation(v => {
            return `updateHigh_${v}`
        }),
        updateLow: jest.fn().mockImplementation(v => {
            return `updateLow_${v}`
        }),
    };
});

const {initialState, selectFormState} = jest.requireActual('../../searchUiSlice');

function generateInputCallbackCases() {

    const inputs = {
        "1": true,
        "-1": false,
        "0": true,
        "4.5": true,
        "abc": false
    };
    const fields = ["low", "high"];
    const events = ["blur", "change"];

    const inputKeys = Object.keys(inputs);

    const cases = [];
    for (let e = 0; e < events.length; ++e) {
        for (let f = 0; f < fields.length; ++f) {
            for (let i = 0; i < inputKeys.length; ++i) {
                cases.push([events[e], fields[f], inputKeys[i], inputs[inputKeys[i]]]);
            }
        }
    }

    return cases;
}


describe("distance search fields component", () => {

    let mockAppState = null;
    const mockRegisterValidationFields = jest.fn();
    const mockUpdateValidationState = jest.fn();

    beforeEach(() => {
        mockAppState = {
            ...initialState
        }

        useSelector.mockImplementation(callback => {
            return mockAppState;
        });
    });

    it("should register its fields on creation", () => {
        mount(<DistanceSearchFields
            registerValidationFields={mockRegisterValidationFields}
            updateValidationState={mockUpdateValidationState}/>);

        expect(mockRegisterValidationFields).toHaveBeenCalledTimes(1)
        expect(mockRegisterValidationFields).toHaveBeenCalledWith(["low", "high"])
    });


    describe("text fields", () => {
        let mockValidState = {};
        let wrapper = null;
        let mockDispatchFn = null;

        let setValidState = jest.fn();
        let setRegisteredState = jest.fn();

        beforeEach(() => {
            mockValidState = {
                low: false,
                high: false
            };

            const mockRegisteredState = true;
            const useStateMock = init => {
                if (init === false) {
                    return [mockRegisteredState, setRegisteredState];
                }
                return [mockValidState, setValidState];
            };
            jest.spyOn(React, 'useState').mockImplementation(useStateMock);

            mockDispatchFn = jest.fn(() => {
            });
            useDispatch.mockImplementation(() => mockDispatchFn);
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        it.each([
            ["low", true],
            ["low", false],
            ["high", true],
            ["high", false],
        ])
        ('should render errors on the %s field when its validState is false', (fieldName, validState) => {
            mockValidState[fieldName] = validState;

            wrapper = mount(<DistanceSearchFields
                registerValidationFields={mockRegisterValidationFields}
                updateValidationState={mockUpdateValidationState}/>);

            const textField = wrapper.findWhere(
                n => n.is(TextField) && n.prop('id') === 'distance-' + fieldName
            );

            expect(textField).toHaveLength(1);
            if (validState) {
                expect(textField.at(0).prop("error")).toBeFalsy();
            } else {
                expect(textField.at(0).prop("error")).toBeTruthy();
            }
        });

        it.each(generateInputCallbackCases())
        ('after %s event, %s should correctly handle input validity [%s, %s]', (eventName, fieldName, textVal, shouldBeValid) => {
            wrapper = mount(<DistanceSearchFields
                registerValidationFields={mockRegisterValidationFields}
                updateValidationState={mockUpdateValidationState}/>);

            const textField = wrapper.findWhere(
                n => n.is(TextField) && n.prop('id') === 'distance-' + fieldName
            );
            expect(textField).toHaveLength(1);

            textField.at(0).find("input").simulate(eventName, {
                target: {value: textVal}
            });

            if (fieldName === "low") {
                expect(updateLow).toHaveBeenCalledTimes(1);
                expect(setValidState).toHaveBeenCalledTimes(1);
                expect(setValidState).toHaveBeenCalledWith({
                    ...mockValidState,
                    [fieldName]: shouldBeValid
                });
            }
        });
    });
});