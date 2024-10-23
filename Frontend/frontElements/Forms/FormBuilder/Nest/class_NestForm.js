import {HTMLelem} from "../../../Classes/HTMLClasses/class_HTMLelem.js";
import {css} from "../../appForms/artistProfileForms/createArtistProfile.js";


class NestForm {

    constructor(input) {

        this.activeStyleCss = input.activeStyleCss;
        this.inactiveStyleCss = input.inactiveStyleCss;
        this.destination = input.destination;

        this.formList = [];

        for (const form of input.formList) {
            this.addForm(form);
        }

        this._currentStep = 0;

        this.currentForm = null;
        //this.previousForm = null;

        this.stepDataCollected = {};
        this.stepDataReturned = {};

        this.displayNest();

    };
    get currentStep() {
        return this._currentStep;
    };

    set currentStep(value) {
        this._currentStep = value;
    };

    //IMPORT FORM METHODS
    addForm(form) {
        form.nest = this;
        this.formList.push(form);
    };

    //DESIGN METHODS
    addStepBoxInSections(css) {

        //adds a box with the stepNumber / totalSteps

        for (const form of this.formList) {

            const boxContent = `step ${this.formList.indexOf(form) + 1} / ${this.formList.length}`;

            const stepBox = new HTMLelem('span', undefined, css);
            stepBox.setText(boxContent);

            const firstSectionTitle = Object.values(form.formTree)[0].sectionRender.firstElementChild;
            //TODO: remettre la stepbox
            //firstSectionTitle.appendChild(stepBox.render());

        }

    };


    changeActiveLayout() {
        //changes the style of the active section
        this.currentForm.render().classList.remove(this.inactiveStyleCss);
        this.currentForm.render().classList.add(this.activeStyleCss);
        this.currentForm.show_submitButton();

        //put the rest in inactive
        this.formList
            .filter(form => form !== this.currentForm)
            .map(form => {
                form.render().classList.add(this.inactiveStyleCss);
                form.render().classList.remove(this.activeStyleCss);
                form.hide_submitButton()
            });
    };

    //PROCESS METHODS
    startProcess() {
        this.currentForm = this.formList[this._currentStep];
        this.changeActiveLayout();
    };

    harvestFormData() {
        this.stepDataCollected[this._currentStep] = this.currentForm.formDataJSON;
        this.stepDataReturned = {...this.stepDataReturned, ...this.currentForm.returnedData ?? null};
    };

    moveToNextStep() {
        //process the current form
        this.harvestFormData();

        //move to next step in array
        this._currentStep ++;
        this.previousForm = this.currentForm;
        this.currentForm = this.formList[this._currentStep];

        //update display
        this.changeActiveLayout();
    };

    stepIsTheLast() {
        return this._currentStep === this.formList.length - 1;
    };

    displayNest() {
        for (const form of this.formList) {
            this.destination.appendChild(form.render());
        }
    };
}

export {NestForm};