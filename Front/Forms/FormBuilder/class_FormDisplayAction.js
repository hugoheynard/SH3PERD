class FormDisplayAction {
    constructor(form) {
        this._form = form
        this.formTree = this.form.formTree;
        this.submitButton = this.form.submitButton;
        this.formElement = this.form.form.render();
    };

    get form() {
        return this._form;
    };
    getElement(elem_id) {

        if (!this.formTree.hasOwnProperty(elem_id)) {
            throw new Error(`element "${elem_id}" doesn't exist in form`);
        }

        return this.formTree[elem_id];
    };
    getFieldContainer(section_id) {
        return this.getElement(section_id).element.fieldsContainer;
    };

    //DISPLAY DESIGN METHODS
    hide_submitButton() {

        if (!this.form.submitButton) {
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

    appendSections() {
        Object.values(this.formTree)
            .filter(elem => elem.type === 'section')
            .sort((a, b) => a.positionInForm - b.positionInForm)
            .map(section => this.formElement.appendChild(section.element.render()));
    };

    appendFields() {
        Object.values(this.formTree)
            .filter(elem => elem.type === 'field')
            .sort((a, b) => a.positionInSection - b.positionInSection)
            .map(field => this.getFieldContainer(field.section).appendChild(field.element.render()));
    };

    render() {
        this.appendSections();
        this.appendFields();

        this.formElement.appendChild(this.submitButton)

        return this.formElement;
    };

}

export {FormDisplayAction};