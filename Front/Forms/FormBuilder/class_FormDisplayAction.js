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

    renderForm() {
        //TODO: Arthur je peux le laisser là?
        const tree = this.form.formTree;
        const renderedElement = this.form.formElement;

        for (const section in tree) {

            const sectionRender = tree[section].sectionRender.render();
            const sectionFieldContainer = tree[section].sectionFieldsContainer.render();
            sectionRender.appendChild(tree[section].sectionHeader.render())
            sectionRender.appendChild(sectionFieldContainer)

            renderedElement.appendChild(sectionRender);
            const sectionFields = tree[section].fields;

            for (const field in sectionFields) {

                const fieldRender = sectionFields[field];

                sectionFieldContainer.appendChild(fieldRender);

            }
        }

        return renderedElement

    };

}

export {FormDisplayAction}