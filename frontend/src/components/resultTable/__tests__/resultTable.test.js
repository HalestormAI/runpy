import React from "react";
import {useDispatch, useSelector} from "react-redux";
import {initialState as initialTableState} from "../resultTableSlice";
import {initialState as initialApiState} from "../../search/searchApiSlice";
import {createMockActivityArray} from "../../../test-utils";
import SearchResultTableComponent from "../index";
import {shallow} from "enzyme";
import TableBody from "@material-ui/core/TableBody";
import TableRow from "@material-ui/core/TableRow";
import {TablePagination} from "@material-ui/core";
import EnhancedTableHead from "../enhancedTableHead";

jest.mock('react-redux', () => ({
    useSelector: jest.fn(),
    useDispatch: jest.fn()
}));

describe("result-table component", () => {

    const mockAppState = {
        searchApi: {
            ...initialApiState
        },
        resultTable: {
            ...initialTableState
        }
    };

    const mockState = (page, rowsPerPage, numActivities) => {
        const st = {...mockAppState};
        st.resultTable.table.pagination.page = page;
        st.resultTable.table.pagination.rowsPerPage = rowsPerPage;
        st.searchApi.activities = createMockActivityArray(numActivities);
        useSelector.mockImplementation(callback => {
            return callback(st)
        });
    }

    beforeEach(() => {
        jest.resetAllMocks();
    });

    describe("activity row rendering based on per-page", () => {

        it("should sort activities according to state and create rows accordingly", () => {
            const page = 0;
            const rowsPerPage = 5;
            const numActivities = 10;

            mockState(page, rowsPerPage, numActivities);
            const wrapper = shallow(<SearchResultTableComponent/>);

            const rows = wrapper.find(TableBody).find(TableRow);
            expect(rows.length).toEqual(rowsPerPage);
        });

        it("should pad with an empty row if activities length < per page", () => {
            const page = 0;
            const rowsPerPage = 15;
            const numActivities = 10;

            mockState(page, rowsPerPage, numActivities);
            const wrapper = shallow(<SearchResultTableComponent/>);

            const rows = wrapper.find(TableBody).find(TableRow);
            expect(rows.length).toEqual(numActivities + 1);
            expect(rows.at(rows.length - 1).prop("style").height)
                .toEqual(53 * (rowsPerPage - numActivities));
        });

        it("should pad with an empty row if activities length < per page", () => {
            const page = 1;
            const rowsPerPage = 10;
            const numActivities = 15;

            mockState(page, rowsPerPage, numActivities);
            const wrapper = shallow(<SearchResultTableComponent/>);

            const rows = wrapper.find(TableBody).find(TableRow);
            expect(rows.length).toEqual(2 * rowsPerPage - numActivities + 1);
            expect(rows.at(rows.length - 1).prop("style").height)
                .toEqual(53 * (2 * rowsPerPage - numActivities));
        });
    });

    describe("paginatino callbacks", () => {
        let mockDispatchFn;

        beforeEach(() => {
            const page = 0;
            const rowsPerPage = 10;
            const numActivities = 15;

            mockState(page, rowsPerPage, numActivities);

            mockDispatchFn = jest.fn(() => {
            });
            useDispatch.mockImplementation(() => mockDispatchFn);

        });

        afterEach(() => {
            jest.resetAllMocks();
        })

        it("should trigger the setPage action", () => {
            const newPage = 13;

            const wrapper = shallow(<SearchResultTableComponent/>);

            const pg = wrapper.find(TablePagination);
            pg.simulate("changePage", {}, newPage);
            expect(mockDispatchFn).toHaveBeenCalledTimes(1);
            expect(mockDispatchFn).toHaveBeenLastCalledWith({
                "payload": 13,
                "type": "searchData/setPage"
            });
        });

        it("should trigger the setRowsPerPage action and setPage to 0", () => {

            const newRowsPerPage = 13;

            const wrapper = shallow(<SearchResultTableComponent/>);

            const pg = wrapper.find(TablePagination);
            pg.simulate("changeRowsPerPage", {target: {value: newRowsPerPage}}, newRowsPerPage);
            expect(mockDispatchFn).toHaveBeenCalledTimes(2);
            expect(mockDispatchFn).toHaveBeenNthCalledWith(1, {
                "payload": newRowsPerPage,
                "type": "searchData/setRowsPerPage"
            });
            expect(mockDispatchFn).toHaveBeenLastCalledWith({
                "payload": 0,
                "type": "searchData/setPage"
            });
        });
    });

    describe("header callbacks", () => {
        let mockDispatchFn;

        beforeEach(() => {
            mockDispatchFn = jest.fn(() => {
            });
            useDispatch.mockImplementation(() => mockDispatchFn);

            const st = {...mockAppState};
            st.resultTable.table.ordering = {
                order: "asc",
                orderBy: "start_date"
            }
            useSelector.mockImplementation(callback => {
                return callback(st)
            });

        });

        afterEach(() => {
            jest.resetAllMocks();
        })

        it("should trigger the set ordering action", () => {
            const newOrderField = "distance";

            const wrapper = shallow(<SearchResultTableComponent/>);

            const th = wrapper.find(EnhancedTableHead);
            th.simulate("requestSort", {}, newOrderField);

            expect(mockDispatchFn).toHaveBeenCalledTimes(1);
            expect(mockDispatchFn).toHaveBeenLastCalledWith({
                "payload": {
                    order: "asc",
                    orderBy: newOrderField
                },
                "type": "searchData/setOrdering"
            });
        });

        it("should trigger the set ordering action", () => {
            const page = 0;
            const rowsPerPage = 10;
            const numActivities = 15;

            mockState(page, rowsPerPage, numActivities);

            const newOrderField = "start_date";

            const wrapper = shallow(<SearchResultTableComponent/>);

            const th = wrapper.find(EnhancedTableHead);
            th.simulate("requestSort", {}, newOrderField);

            expect(mockDispatchFn).toHaveBeenCalledTimes(1);
            expect(mockDispatchFn).toHaveBeenLastCalledWith({
                "payload": {
                    order: "desc",
                    orderBy: newOrderField
                },
                "type": "searchData/setOrdering"
            });
        });
    });
});