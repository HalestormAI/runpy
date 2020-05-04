import moment from "moment";

export const isDate = (str) => moment(str, "YYYY-MM-DDTHH:mm:ssZ", true).isValid();

function descendingComparator(a, b, orderBy) {
    const elemA = isDate(a[orderBy]) ? new Date(a[orderBy]) : a[orderBy];
    const elemB = isDate(b[orderBy]) ? new Date(b[orderBy]) : b[orderBy];

    if (elemB < elemA) {
        return -1;
    }
    if (elemB > elemA) {
        return 1;
    }
    return 0;
}

export function getComparator(order, orderBy) {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}

export function stableSort(array, comparator) {
    const stabilizedThis = array.map((el, index) => [el, index]);
    stabilizedThis.sort((a, b) => {
        const order = comparator(a[0], b[0]);
        if (order !== 0) return order;
        return a[1] - b[1];
    });
    return stabilizedThis.map(el => el[0]);
}