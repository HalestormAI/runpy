import reducer, {initialState, selectFormState, setType, updateHigh, updateLow} from "../searchUiSlice";
import {randomString} from "../../../test-utils";

describe('slice for search UI', () => {

    describe("reducers", () => {
        it('should return the initial state on first run', () => {
            const nextState = initialState;
            const result = reducer(undefined, {});
            expect(result).toEqual(nextState);
        });

        it('should set the low value field', () => {
            const lowBound = Math.random();
            const nextState = reducer(initialState, updateLow(lowBound));
            const rootState = {searchForm: nextState};
            const formState = selectFormState(rootState);
            expect(formState.values.low).toEqual(lowBound);
        });

        it('should set the high value field', () => {
            const highBound = Math.random();
            const nextState = reducer(initialState, updateHigh(highBound));
            const rootState = {searchForm: nextState};
            const formState = selectFormState(rootState);
            expect(formState.values.high).toEqual(highBound);
        });

        it('should set the type correctly if it is valid', () => {
            const newType = "distance";
            const nextState = reducer(initialState, setType(newType));
            const rootState = {searchForm: nextState};
            const formState = selectFormState(rootState);
            expect(formState.type).toEqual(newType);
        });

        it('should throw if the type is not valid', () => {
            const newType = randomString();
            const t = () => reducer(initialState, setType(newType));
            expect(t).toThrowError();
        });
    });
});