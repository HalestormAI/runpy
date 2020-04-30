import config from "../app/config/config";

async function call(dispatch, url_suffix, done_cb, success_cb, error_cb, call_id=0, callMonitor={c:0}) {
    const url = config.api_root + url_suffix;
    try {
        const rawResponse = await fetch(url);
        dispatch(done_cb());

        if (call_id !== callMonitor.c) {
            console.log("Active call doesn't match -> not parsing JSON")
            return;
        }

        const response = await rawResponse.json();

        if (call_id !== callMonitor.c) {
            console.log("Active call doesn't match -> ignoring error")
            return;
        }

        if (response["status"] === "error") {
            console.log("Status was an error");
            dispatch(error_cb(response));
            return;
        }

        if (call_id !== callMonitor.c) {
            console.log("Active call doesn't match -> not dispatching")
            return;
        }

        response.call_id = call_id;

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