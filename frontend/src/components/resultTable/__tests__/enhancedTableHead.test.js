import {shallow} from "enzyme";
import React from "react";
import {headCells} from "../index";
import EnhancedTableHead from "../enhancedTableHead";
import {TableCell} from "@material-ui/core";
import TableSortLabel from '@material-ui/core/TableSortLabel';


describe("the enhanced head component", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    })

    it("should render the correct number of header cells", () => {

        const tableState = {
            ordering: {
                order: 'desc',
                orderBy: "start_date"
            }
        };

        const handleRequestSort = jest.fn();

        const numHeadings = headCells.length;

        const wrapper = shallow(<EnhancedTableHead
            headCells={headCells}
            order={tableState.ordering.order}
            orderBy={tableState.ordering.orderBy}
            onRequestSort={handleRequestSort}
        />);

        const cells = wrapper.find(TableCell);
        expect(cells).toHaveLength(numHeadings);
    });

    it.each(headCells.map((x, idx) => ({idx, id: x.id})))
    ("should sort by %s, other cells should sort === false", sortField => {

        const tableState = {
            ordering: {
                order: 'desc',
                orderBy: sortField.id
            }
        };

        const handleRequestSort = jest.fn();

        const wrapper = shallow(<EnhancedTableHead
            headCells={headCells}
            order={tableState.ordering.order}
            orderBy={tableState.ordering.orderBy}
            onRequestSort={handleRequestSort}
        />);

        const cells = wrapper.find(TableCell);
        expect(cells.at(sortField.idx).prop('sortDirection'))
            .toEqual(tableState.ordering.order);

        [...Array(headCells.length).keys()]
            .filter(idx => idx !== sortField.idx)
            .forEach(x => {
                expect(cells.at(x).prop('sortDirection'))
                    .toBeFalsy();
            })
    });

    it.each(["asc", "desc"])
    ("should sort by order [%s]", sortOrder => {

        const tableState = {
            ordering: {
                order: sortOrder,
                orderBy: headCells[0].id
            }
        };

        const handleRequestSort = jest.fn();

        const wrapper = shallow(<EnhancedTableHead
            headCells={headCells}
            order={tableState.ordering.order}
            orderBy={tableState.ordering.orderBy}
            onRequestSort={handleRequestSort}
        />);

        const cells = wrapper.find(TableCell);

        expect(cells.at(0).prop('sortDirection'))
            .toEqual(sortOrder);
    });

    it.each(headCells.map((x, idx) => ({idx, id: x.id})))
    ("should trigger the sort callback when the cell is clicked", sortField => {

        const tableState = {
            ordering: {
                order: "desc",
                orderBy: sortField.id
            }
        };

        const handleRequestSort = jest.fn();

        const wrapper = shallow(<EnhancedTableHead
            headCells={headCells}
            order={tableState.ordering.order}
            orderBy={tableState.ordering.orderBy}
            onRequestSort={handleRequestSort}
        />);


        const cells = wrapper.find(TableSortLabel);

        const mockClickData = {
            target: {
                name: sortField.id + "_click"
            }
        };

        cells.at(sortField.idx).simulate("click", mockClickData);

        expect(handleRequestSort).toHaveBeenCalledTimes(1);
        expect(handleRequestSort).toHaveBeenLastCalledWith(mockClickData, sortField.id);
    });
});