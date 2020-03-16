import config from "../app/config/config";

function call(dispatch, url_suffix, done_cb, success_cb, error_cb) {
    const url = config.api_root + url_suffix;
    return fetch(url)
        .then((response) => {
            dispatch(done_cb());
            return response.json()
        }).then((response) => {
            if (response["status"] === "error") {
                dispatch(error_cb(response));
                return;
            }
            dispatch(success_cb(response));
        })
        .catch(error => {
            console.log(error);
            dispatch(error_cb({
                message: error.toString()
            }));
        });
}

export {
    call
}