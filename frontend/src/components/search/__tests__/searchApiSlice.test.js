import reducer, {
    initialState,
    performSearch,
    searchClearError,
    searchDone,
    searchError,
    searchFetch,
    searchSuccess,
    selectActivities,
    selectApiState
} from '../searchApiSlice';
import {createMockActivityArray, randomString} from "../../../test-utils";
import {call} from "../../../utils/api";

jest.mock('../../../utils/api', () => ({
    call: jest.fn((...args) => {
        // console.log(args)
    })
}));


describe('slice for API search requests', () => {

    describe("reducers", () => {

        it('should return the initial state on first run', () => {
            const nextState = initialState;
            const result = reducer(undefined, {});
            expect(result).toEqual(nextState);
        });

        it('should set the API state to "waiting" when fetch is called', () => {
            const nextState = reducer(initialState, searchFetch());
            const rootState = {searchApi: nextState};
            const apiState = selectApiState(rootState);
            expect(apiState.waiting).toBeTruthy();
        });

        it('should return waiting state to false when "done" is called', () => {
            const init = {
                ...initialState,
                data: {
                    ...initialState.data,
                    waiting: true
                }
            }

            const nextState = reducer(init, searchDone());
            const rootState = {searchApi: nextState};
            const apiState = selectApiState(rootState);
            expect(apiState.waiting).toBeFalsy();
        });

        // Waiting state should be set with the searchDone action, so we'll make sure it's
        // unchanged by the searchSuccess action. I'm unsure if this way of handling API
        // state makes sense... Might refactor later.
        it.each([[[]], [createMockActivityArray(10)]])
        ('should update activity list and nullify error on success. Waiting state should not change.', (initActivities) => {
            const mockWaiting = randomString();
            const init = {
                ...initialState,
                activities: initActivities,
                data: {
                    ...initialState.data,
                    waiting: mockWaiting
                }
            }

            const numNewActivities = 15;
            const newActivities = createMockActivityArray(numNewActivities);

            const nextState = reducer(init, searchSuccess({
                activities: newActivities
            }));

            const rootState = {searchApi: nextState};
            const activities = selectActivities(rootState);
            const apiState = selectApiState(rootState);

            expect(apiState.errorMessage).toBeNull();
            expect(activities).toHaveLength(numNewActivities);
            expect(activities).toEqual(newActivities);
            expect(apiState.waiting).toEqual(mockWaiting);
        });

        it('should set the error message when the error action is called', () => {
            const init = {
                ...initialState,
                data: {
                    ...initialState.data,
                    waiting: true
                }
            }

            const expectedString = randomString();

            const nextState = reducer(init, searchError({
                message: expectedString
            }));

            const rootState = {searchApi: nextState};
            const apiState = selectApiState(rootState);
            expect(apiState.waiting).toBeFalsy();
            expect(apiState.errorMessage).toEqual(expectedString);
        });

        it('should clear the error message when the error clear action is called', () => {
            const init = {
                ...initialState,
                data: {
                    ...initialState.data,
                    errorMessage: randomString()
                }
            }

            const nextState = reducer(init, searchClearError());
            const rootState = {searchApi: nextState};
            const apiState = selectApiState(rootState);
            expect(apiState.errorMessage).toBeNull();
        });
    });

    describe('performSearch thunk', () => {

        it('should update the number of rows and set local storage', () => {
            const lowBound = 5;
            const highBound = 10;

            const mockDispatch = jest.fn();

            const rootState = {
                searchApi: initialState,
                searchForm: {
                    type: "distance",
                    values: {
                        low: lowBound,
                        high: highBound
                    }
                }
            };

            performSearch()(mockDispatch, () => rootState);

            expect(mockDispatch).toHaveBeenCalledTimes(1);
            expect(call).toHaveBeenCalledTimes(1);
            expect(call)
                .toBeCalledWith(
                    mockDispatch,
                    '/search/distance/5/10',
                    searchDone,
                    searchSuccess,
                    searchError
                );
        });

        it('should throw for an unsupported form type', () => {
            const lowBound = 5;
            const highBound = 10;

            const mockDispatch = jest.fn();

            const rootState = {
                searchApi: initialState,
                searchForm: {
                    type: randomString(),
                    values: {
                        low: lowBound,
                        high: highBound
                    }
                }
            };

            const t = () => performSearch()(mockDispatch, () => rootState);
            expect(t).toThrowError();
        });

    });
});
