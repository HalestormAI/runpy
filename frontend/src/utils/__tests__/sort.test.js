import {getComparator, stableSort} from "../sort";

describe('the comparator for stable sorting over general objects', () => {

    const checkComparators = (objects, comps, expected) => {
        for (let i = 0; i < comps.length; ++i) {
            expect(comps[i](objects[0], objects[1])).toEqual(expected[i][0]);
            expect(comps[i](objects[1], objects[0])).toEqual(expected[i][1]);
        }
    }

    const objects = [
        {idx0: 2, idx1: 1, idx2: 0},
        {idx0: 0, idx1: 1, idx2: 2}
    ];

    const comps = (isDesc) => [
        getComparator(isDesc ? "desc" : "asc", "idx0"),
        getComparator(isDesc ? "desc" : "asc", "idx1"),
        getComparator(isDesc ? "desc" : "asc", "idx2"),
    ];

    it('should return a comparator for ascending order on the given field', () => {
        const expected = [
            [1, -1],
            [-0, -0],
            [-1, 1]
        ];

        checkComparators(objects, comps(false), expected);
    });

    it('should return a comparator for descending order on the given field', () => {
        const expected = [
            [-1, 1],
            [0, 0],
            [1, -1]
        ];

        checkComparators(objects, comps(true), expected);
    });
});

describe("the stableSort algorithm for a general array over objects", () => {

    let objects = null;
    let objectsJson = null;

    beforeEach(() => {
        objects = [
            {
                original_idx: 0,
                sort_idx: 3,
                expected_idx_asc: 2,
                expected_idx_desc: 1,
            },
            {
                original_idx: 0,
                sort_idx: 2,
                expected_idx_asc: 1,
                expected_idx_desc: 2,
            },
            {
                original_idx: 0,
                sort_idx: 7,
                expected_idx_asc: 3,
                expected_idx_desc: 0,
            },
            {
                original_idx: 0,
                sort_idx: 1,
                expected_idx_asc: 0,
                expected_idx_desc: 3,
            }
        ];

        // Used to check for out-of-place sorting vs inplace sorting
        objectsJson = JSON.stringify(objects);
    });

    it("should sort the objects according to their sort idx", () => {
        const ascComparator = getComparator("asc", "sort_idx");

        const ascSorted = stableSort(objects, ascComparator)
        for (let i = 0; i < ascSorted.length; ++i) {
            expect(ascSorted[i].expected_idx_asc).toEqual(i);
        }

        expect(JSON.stringify(objects)).toEqual(objectsJson);
        expect(JSON.stringify(objects)).not.toEqual(JSON.stringify(ascSorted));
    });

    it("should sort the objects according to their sort idx", () => {
        const descComparator = getComparator("desc", "sort_idx");

        const descSorted = stableSort(objects, descComparator)
        for (let i = 0; i < descSorted.length; ++i) {
            expect(descSorted[i].expected_idx_desc).toEqual(i);
        }

        expect(JSON.stringify(objects)).toEqual(objectsJson);
        expect(JSON.stringify(objects)).not.toEqual(JSON.stringify(descSorted));
    });
});