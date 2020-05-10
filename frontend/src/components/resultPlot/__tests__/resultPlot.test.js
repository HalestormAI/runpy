import React from "react";
import Plot from '../../../../node_modules/react-plotly.js/react-plotly';
import {shallow} from 'enzyme'
import SearchResultPlotComponent, {createData, formatActivityText, updatePlotState} from "../index";
import {useSelector} from "react-redux";
import {initialState as uiInitialState, selectFormState} from "../../search/searchUiSlice";
import {selectActivities} from "../../search/searchApiSlice";
import {createMockActivity, createMockActivityArray, randomString} from "../../../test-utils";
import {dateFormat, distanceFormat, pad, speedToPaceMS} from "../../../utils/ui";

jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
}));

jest.mock('../../../app/config/config.json', () => ({
    locale: 'en-GB'
}), {virtual: true})


describe("createData", () => {

    describe('text formatting', () => {
        it("should correctly create a text summary for an activity", () => {
            const activity = createMockActivity();
            const textSummary = formatActivityText(activity);

            const regex = /\[(\d{2}\/\d{2}\/\d{4})] (.+) \((\d\.\d{2})km\)/;
            const t = textSummary.match(regex);
            expect(t[1]).toEqual(dateFormat(activity.start_date));
            expect(t[2]).toEqual(activity.name);
            expect(t[3]).toEqual(distanceFormat(activity.distance));
        })
    });

    it("should filter out activities with non-Positive speed", () => {
        const activities = createMockActivityArray(10);

        const dataAllPositive = createData(activities);
        expect(dataAllPositive.x.length).toEqual(activities.length);
        expect(dataAllPositive.y.length).toEqual(activities.length);
        expect(dataAllPositive.text.length).toEqual(activities.length);

        activities.push(createMockActivity({average_speed: 0}));
        activities.push(createMockActivity({average_speed: -1}));
        const dataNotAllPositive = createData(activities);
        expect(dataNotAllPositive.x.length).toEqual(activities.length - 2);
        expect(dataNotAllPositive.y.length).toEqual(activities.length - 2);
        expect(dataNotAllPositive.text.length).toEqual(activities.length - 2);
    });

    it("should correctly sort by date in ascending order", () => {
        const startDates = [
            {
                date: new Date("2020-05-10"),
                sortIdx: 3
            },
            {
                date: new Date("2020-05-06"),
                sortIdx: 2
            },
            {
                date: new Date("2020-02-01"),
                sortIdx: 0
            },
            {
                date: new Date("2020-03-06"),
                sortIdx: 1
            },
        ];

        const activities = startDates.map(d => createMockActivity({start_date: d.date}));

        const data = createData(activities)

        startDates.forEach((d, idx) => {
            // Check the date field is correctly sorted (x-axis)
            expect(data.x[d.sortIdx]).toEqual(d.date);

            // Check the pace field is correctly sorted (y-axis)
            const paceDate = new Date(data.y[d.sortIdx]);
            const mins = paceDate.getMinutes();
            const secs = paceDate.getSeconds();
            const paceStr = `${pad(mins)}:${pad(secs)}`;
            expect(speedToPaceMS(activities[idx].average_speed)).toEqual(paceStr);

            // Check the labels field is correctly sorted
            const expectedText = formatActivityText(activities[idx]);
            expect(expectedText).toEqual(data.text[d.sortIdx]);
        });
    });
});

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