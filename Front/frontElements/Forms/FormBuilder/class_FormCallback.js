class FormRecall {
    /**Uses the instance of the original form
    * Inserts the recalled values as new default values for display
    * Updates the submitAction
    * Adds a delete button*/
    //TODO: Manager le recall des champs dynamiques - if field is a trigger =>
    #form;
    #recalledValues;
    #updateAction;
    #deleteAction;
    constructor(input){
        this.#form = input.callbackForm;
        this.#recalledValues = input.recalledValues;
        this.#updateAction = input.updateAction;
        this.#deleteAction = input.deleteAction;

        this.#recallForm();
        this.#updateSubmitButton();
        this.#addDeleteButton();
    };
    #recallForm() {
        for (const name in this.#recalledValues) {
            const targetField = this.#form.formTree[name];

            if (targetField) {
                targetField.element.manageDefaultValue(this.#recalledValues[name]);
                /**because of the different behaviours and custom design of certain fields
                the "dispatch new Event" is incorporated into the FormFields manage default values class*/
            }
        }
    };
    #updateSubmitButton() {
        this.#form.submitButton.textContent = 'update';
        this.#form.submitAction = this.#updateAction;
    };
    #addDeleteButton() {
        if (this.#deleteAction) {
            this.#form.add_deleteButton('Delete', 'deleteEventButton', this.#form.submitButton.getAttribute('class'));
            this.#form.deleteButton.addEventListener('click', this.#deleteAction);
            this.#form.formElement.appendChild(this.#form.deleteButton);
        }
    };
    render() {
        return this.#form.formElement;
    };
}
export {FormRecall};