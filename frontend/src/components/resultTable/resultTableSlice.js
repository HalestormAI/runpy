import {createSlice} from "@reduxjs/toolkit";


export const slice = createSlice({
    name: 'searchData',
    initialState: {
        table: {
            pagination: {
                rowsPerPage: parseInt(localStorage.getItem("resultTable.rowsPerPage"), 10) || 25,
                page: 0,
            },
            ordering: {
                order: 'desc',
                orderBy: 'start_date'
            }
        }
    },
    reducers: {
        setRowsPerPage: (state, action) => {
            state.table.pagination.rowsPerPage = action.payload;
            localStorage.setItem("resultTable.rowsPerPage", action.payload)
        },
        setPage: (state, action) => {
            state.table.pagination.page = action.payload;
        },
        setOrdering: (state, action) => {
            state.table.ordering.order = action.payload.order;
            state.table.ordering.orderBy = action.payload.orderBy;
        },
    }
});


export const {setRowsPerPage, setPage, setOrdering} = slice.actions;

export default slice.reducer;

export const selectTableState = state => state.resultTable.table;
