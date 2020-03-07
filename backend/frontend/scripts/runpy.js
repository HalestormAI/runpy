class RunPy {
    constructor(api_url) {
        this.api_url = api_url;
        this.ui = new UI();
    }

    update() {
        this.api_call("/data/fetch/activities")
            .then((myJson) => {
                console.log(myJson);
            });
    }

    search(form_elem) {
        console.log(form_elem);
        this.ui.error_container.hide()

        const validate_number = elem => Boolean(elem.value);
        const form_validation = {
            "distance_low": [form_elem.distance_low, validate_number],
            "distance_high": [form_elem.distance_high, validate_number]
        };

        if (this.ui.validate_form(form_validation)) {
            const url = `/search/distance/${form_elem.distance_low.value}/${form_elem.distance_high.value}`;
            this.api_call(url)
                .then((response) => {
                    console.log(response);
                });
        }
    }

    clear_data() {
        this.api_call("/data/clear/activities")
            .then((myJson) => {
                console.log(myJson);
            });
    }

    api_call(url_suffix) {
        this.ui.spinner.show();
        const url = this.api_url + url_suffix
        return fetch(url)
            .then((response) => {
                this.ui.spinner.hide();
                return response.json()
            }).then((response) => {
                if (response["status"] === "error") {
                    this.ui.show_error(response["message"]);
                }
                return response;
            });
    }
}