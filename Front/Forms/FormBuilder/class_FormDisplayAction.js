class FormDisplayAction {
    constructor(form) {
        this.form = form
    };

    //DISPLAY DESIGN METHODS

    hide_submitButton() {

        this.form.formElement.removeChild(this.form.submitButton);

    };

    show_submitButton() {

        this.form.formElement.appendChild(this.form.submitButton);

    };

    render() {

        return this.form.formElement;

    };

}

export {FormDisplayAction}