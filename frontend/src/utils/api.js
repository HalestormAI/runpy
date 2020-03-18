import config from "../app/config/config";

async function call(dispatch, url_suffix, done_cb, success_cb, error_cb) {
    const url = config.api_root + url_suffix;
    try {
        const rawResponse = await fetch(url);
        dispatch(done_cb());

        const response = await rawResponse.json();

        if (response["status"] === "error") {
            console.log("Status was an error");
            dispatch(error_cb(response));
            return;
        }

        dispatch(success_cb(response));
    } catch (error) {
        dispatch(error_cb({
            message: error.toString()
        }));
    }
}

export {
    call
}