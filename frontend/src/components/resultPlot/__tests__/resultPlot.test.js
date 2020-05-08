import React from "react";
import Plot from '../../../../node_modules/react-plotly.js/react-plotly';
import {shallow} from 'enzyme'
import SearchResultPlotComponent, {updatePlotState} from "../index";
import {useSelector} from "react-redux";
import {initialState as uiInitialState, selectFormState} from "../../search/searchUiSlice";
import {selectActivities} from "../../search/searchApiSlice";
import {randomString} from "../../../test-utils";

jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
}));

describe("the result plot component", () => {

    describe("no activities", () => {

        let mockAppStates = null;

        beforeEach(() => {
            useSelector.mockImplementation(callback => {
                return mockAppStates[callback];
            });
            mockAppStates = {
                [selectFormState]: {
                    ...uiInitialState
                },
                [selectActivities]: []
            }
        });

        afterEach(() => {
            jest.resetAllMocks();
        });

        afterEach(() => {
            jest.resetAllMocks();
        })

        it('should render', () => {
            const wrapper = shallow(<SearchResultPlotComponent/>);
            const plot = wrapper.find(Plot);
            expect(plot).toMatchSnapshot();
            const props = plot.props();
            expect(props.data[0].x).toHaveLength(0);
            expect(props.data[0].y).toHaveLength(0);
            expect(props.data[0].text).toHaveLength(0);
            expect(props.layout.title).toEqual("Pace (mins/km) over time 0.00km ... 0.00km");
            expect(props.layout.yaxis.tickformat).toEqual("%M:%S");
            expect(props.layout.xaxis.tickformat).toEqual("%Y-%m-%d");
        });
    });

    describe('plot title', () => {

        let mockAppStates = null;

        beforeEach(() => {
            useSelector.mockImplementation(callback => {
                return mockAppStates[callback];
            });
            mockAppStates = {
                [selectFormState]: {
                    ...uiInitialState,
                    values: {
                        low: 1234,
                        high: 5678
                    }
                },
                [selectActivities]: []
            }
        });


        it('should have a title that reflects the low/high bounds', () => {
            const wrapper = shallow(<SearchResultPlotComponent/>);
            const plot = wrapper.find(Plot);
            const props = plot.props();
            expect(props.layout.title).toEqual("Pace (mins/km) over time 1.23km ... 5.68km");
        })
    });

    describe("some activities", () => {

        const mockAppStates = {
            [selectFormState]: {
                ...uiInitialState
            },
            [selectActivities]: [1, 2, 3].map(() => ({
                average_speed: 5 * Math.random(),
                workout_type: randomString(),
                start_date: Date.now().toLocaleString()
            }))
        }

        beforeEach(() => {
            useSelector.mockImplementation(callback => {
                return mockAppStates[callback];
            });
        });

        afterEach(() => {
            jest.resetAllMocks();
        })

        afterEach(() => {
            jest.resetAllMocks();
        });

        it('should render', () => {
            const wrapper = shallow(<SearchResultPlotComponent/>);
            const plot = wrapper.find(Plot);
            const props = plot.props();
            expect(props.data[0].x).toHaveLength(3);
            expect(props.data[0].y).toHaveLength(3);
            expect(props.data[0].text).toHaveLength(3);
            expect(props.layout.title).toEqual("Pace (mins/km) over time 0.00km ... 0.00km");
            expect(props.layout.yaxis.tickformat).toEqual("%M:%S");
            expect(props.layout.xaxis.tickformat).toEqual("%Y-%m-%d");
        });

        it('should update the state when update fires', () => {
            const mockTitle = randomString();

            const mockState = {
                layout: {
                    initial: "layoutValue",
                    overwriteme: "original"
                },
                config: {},
                frames: {}
            }

            const mockLayoutMemo = {
                yaxis: {
                    tickformat: "%M:%S"
                },
                xaxis: {
                    tickformat: "%Y-%m-%d"
                }
            };

            const mockFig = {
                layout: {
                    title: mockTitle,
                    overwriteme: "overwriteme"
                },
                config: {
                    configKey: "configValue"
                },
                frames: {
                    framesKey: "framesValue"
                }
            };

            expect(mockState.layout.initial).toEqual("layoutValue");
            expect(mockState.layout.overwriteme).toEqual("original");
            expect(mockState.layout).not.toHaveProperty("title");
            expect(mockState.layout).not.toHaveProperty("yaxis");
            expect(mockState.layout).not.toHaveProperty("xaxis");
            expect(mockState.config).toEqual({});
            expect(mockState.frames).toEqual({});

            const setState = jest.fn(newState => {
                console.log(newState)
                expect(newState.layout.initial).toEqual("layoutValue");
                expect(newState.layout.overwriteme).toEqual("overwriteme");
                expect(newState.layout.title).toEqual(mockTitle);
                expect(newState.layout.yaxis.tickformat).toEqual(mockLayoutMemo.yaxis.tickformat);
                expect(newState.layout.xaxis.tickformat).toEqual(mockLayoutMemo.xaxis.tickformat);
                expect(newState.config.configKey).toEqual("configValue");
                expect(newState.frames.framesKey).toEqual("framesValue");
            })

            updatePlotState(mockState, setState, mockFig, mockLayoutMemo);
        });
    });

});