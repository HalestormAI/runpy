import reducer, {initialState, selectTableState, setOrdering, setPage, setRowsPerPage} from '../resultTableSlice';
import {randomString} from "../../../test-utils";

describe('slice for the results table', () => {

    beforeEach(() => {
        localStorage.clear();
    });

    it('should return the initial state on first run', () => {
        const nextState = initialState;
        const result = reducer(undefined, {});
        expect(result).toEqual(nextState);
    });

    it('should update the number of rows and set local storage', () => {
        const perPage = Math.round(20 * Math.random());
        const nextState = reducer(initialState, setRowsPerPage(perPage));

        expect(localStorage.setItem).toHaveBeenLastCalledWith('resultTable.rowsPerPage', perPage);
        expect(localStorage.__STORE__['resultTable.rowsPerPage']).toBe(perPage.toString());
        expect(Object.keys(localStorage.__STORE__).length).toBe(1);

        const rootState = {resultTable: nextState};
        const tableState = selectTableState(rootState);
        expect(tableState.pagination.rowsPerPage).toEqual(perPage);
    });

    it('should update the number of page', () => {
        const pageNum = Math.round(20 * Math.random());
        const nextState = reducer(initialState, setPage(pageNum));

        const rootState = {resultTable: nextState};
        const tableState = selectTableState(rootState);
        expect(tableState.pagination.page).toEqual(pageNum);
    });

    it('should update sort ordering', () => {
        const newOrdering = {
            order: randomString(),
            orderBy: randomString()
        };
        const pageNum = Math.round(20 * Math.random());
        const nextState = reducer(initialState, setOrdering(newOrdering));

        const rootState = {resultTable: nextState};
        const tableState = selectTableState(rootState);
        expect(tableState.ordering.order).toEqual(newOrdering.order);
        expect(tableState.ordering.orderBy).toEqual(newOrdering.orderBy);
    });
});
