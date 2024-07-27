class FormDisplayAction {
    constructor(form) {

        this._form = form

    };

    get form() {
        return this._form;
    };

    //DISPLAY DESIGN METHODS

    hide_submitButton() {

        if(!this.form.submitButton){
            throw new Error('This form doesnt have a submit button');
        }

        this.form.formElement.removeChild(this.form.submitButton);
        return;
    };

    show_submitButton() {

        if(!this.form.submitButton){
            throw new Error('This form doesnt have a submit button');
        }

        this.form.formElement.appendChild(this.form.submitButton);
        return;
    };

    render() {
        return this.form.formElement;
    };

}

export {FormDisplayAction}