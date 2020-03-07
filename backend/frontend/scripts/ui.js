class Modal {
    constructor(id_key) {
        this.element = document.getElementById(id_key);
    }

    show() {
        this.element.classList.add("modal-active");
    }

    hide() {
        this.element.classList.remove("modal-active");
    }

    toggle() {
        if (this.element.classList.contains("modal-active")) {
            this.hide();
        } else {
            this.show();
        }
    }
}

class UI {
    constructor() {
        this.spinner = new Modal("spinner_cnt");
        this.error_container = new Modal("error_cnt");
    }

    validate_form(fields_and_conditions) {
        let all_passed = true;
        for (let [key, value] of Object.entries(fields_and_conditions)) {
            const elem = value[0];
            const validation_func = value[1];
            const is_valid = validation_func(elem);
            if (!is_valid) {
                elem.classList.add("error");
                console.log(`Validation failed for field ${key}`)
            } else {
                elem.classList.remove("error");
            }
            all_passed &= is_valid;
        }
        return all_passed;
    }

    show_error(message) {
        const cnt = this.error_container;
        cnt.element.innerText = message;
        cnt.show();
        // setTimeout(() => {
        //     console.log("Hiding", cnt);
        //     cnt.hide();
        // }, 3000)
    }

}