import {call} from "../api"

jest.mock('../../app/config/config', () => ({
    api_root: "http://www.example.com/"
}), {virtual: true})


describe("The call method from the api-helper module", () => {
    beforeEach(() => {
        fetch.resetMocks();
    });

    it('should call fetch with the given URL and call success cb with the correct callback', () => {
        const expectedResponse = {status: "success", data: '12345'}
        const apiPath = "v1/api/random/string";

        fetch.mockResponseOnce(JSON.stringify(expectedResponse))

        const done_cb = jest.fn();
        const success_cb = jest.fn(d => {
            expect(d).toEqual(expectedResponse);
        });
        const error_cb = jest.fn();
        const mock_dispatch = jest.fn();

        call(mock_dispatch, apiPath, done_cb, success_cb, error_cb)
            .then(() => {
                expect(error_cb).not.toHaveBeenCalled();
                expect(done_cb).toHaveBeenCalledTimes(1);
                expect(success_cb).toHaveBeenCalledTimes(1);
                expect(mock_dispatch).toHaveBeenCalledTimes(2);
            });
        expect(fetch.mock.calls.length).toEqual(1)
        expect(fetch.mock.calls[0][0]).toEqual('http://www.example.com/' + apiPath)

    });

    it('Should call the error callback on a failed fetch with the reason as a message', () => {
        const apiPath = "v1/api/random/string";

        fetch.mockReject(new Error('fake error message'))

        const done_cb = jest.fn();
        const success_cb = jest.fn();
        const error_cb = jest.fn(err => {
            expect(err).toEqual({message: 'Error: fake error message'});
        });
        const mock_dispatch = jest.fn();

        call(mock_dispatch, apiPath, done_cb, success_cb, error_cb)
            .then(() => {
                expect(done_cb).toHaveBeenCalledTimes(1);
                expect(error_cb).toHaveBeenCalledTimes(1);
                expect(success_cb).not.toHaveBeenCalled;
                expect(mock_dispatch).toHaveBeenCalledTimes(2);
            });
        expect(fetch.mock.calls.length).toEqual(1)
        expect(fetch.mock.calls[0][0]).toEqual('http://www.example.com/' + apiPath)
    });

    it('Should call the error callback on an API error, forwarding the response', () => {
        const expectedResponse = {status: "error", reason: 'Something broke in the backend - should have written more tests...'}
        const apiPath = "v1/api/random/string";

        fetch.mockResponseOnce(JSON.stringify(expectedResponse))

        const done_cb = jest.fn();
        const success_cb = jest.fn();
        const error_cb = jest.fn(err => {
            expect(err).toEqual(expectedResponse);
        });
        const mock_dispatch = jest.fn();

        call(mock_dispatch, apiPath, done_cb, success_cb, error_cb)
            .then(() => {
                expect(done_cb).toHaveBeenCalledTimes(1);
                expect(error_cb).toHaveBeenCalledTimes(1);
                expect(success_cb).not.toHaveBeenCalled();
                expect(mock_dispatch).toHaveBeenCalledTimes(2);
            });
        expect(fetch.mock.calls.length).toEqual(1)
        expect(fetch.mock.calls[0][0]).toEqual('http://www.example.com/' + apiPath)
    });
})