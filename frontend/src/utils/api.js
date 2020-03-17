import config from "../app/config/config";

async function call(dispatch, url_suffix, done_cb, success_cb, error_cb) {
    const url = config.api_root + url_suffix;
    try {
        const rawResponse = await fetch(url);
        dispatch(done_cb());

        const response = await rawResponse.json();
        console.log(response);
        if (response["status"] === "error") {
            console.log("Status was an error");
            dispatch(error_cb(response));
            return;
        }

        console.log("Dispatching");
        dispatch(success_cb(response));
    } catch (error) {
        console.log(error);
        dispatch(error_cb({
            message: error.toString()
        }));
    }
}

export {
    call
}