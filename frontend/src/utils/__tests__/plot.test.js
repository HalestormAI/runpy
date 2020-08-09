import {defaultPlotLayout, initialPlotState} from "../plot";
import {randomString} from "../../test-utils";

describe("Helper functions for plotting from the plot module", () => {

    it("should setup the colours from the theme and correctly set the title", () => {

        const darker = "#000000";
        const grey = "#333333"
        const red = "#ff0000"
        const mockTheme = {
            palette: {
                background: {
                    default: darker,
                    paper: grey
                },
                text: {
                    primary: red
                }
            }
        }

        const title = randomString();

        const layout = defaultPlotLayout(mockTheme, title);

        expect(layout.autosize).toBeTruthy();
        expect(layout.responsize).toBeTruthy();
        expect(layout.yaxis.gridcolor).toEqual(darker);
        expect(layout.yaxis.zerolinecolor).toEqual(darker);
        expect(layout.yaxis.linecolor).toEqual(darker);
        expect(layout.xaxis.gridcolor).toEqual(darker);
        expect(layout.xaxis.zerolinecolor).toEqual(darker);
        expect(layout.xaxis.linecolor).toEqual(darker);
        expect(layout.plot_bgcolor).toEqual(grey);
        expect(layout.paper_bgcolor).toEqual(grey);
        expect(layout.title).toEqual(title);
        expect(layout.font.color).toEqual(red);
    });

    it("Should deep-copy the layout object and creat empty frames/config", () => {
        const red = "#ff0000"
        const mockLayout = {
            autosize: true,
            yaxis: {
                gridcolor: red
            }
        };

        const state = initialPlotState(mockLayout);
        expect(state.frames).toEqual([]);
        expect(state.config).toEqual({});

        expect(state.layout.autosize).toBeTruthy();
        expect(state.layout.yaxis.gridcolor).toEqual(red);

        // Confirm it was a deep copy by modifying the original object.
        // The plot state shouldn't change.
        mockLayout.autosize = false;
        expect(state.layout.autosize).toBeTruthy();
    });
});