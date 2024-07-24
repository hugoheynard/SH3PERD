import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";

class NestForm {
    constructor(activeStyleCss, inactiveStyleCss) {

        this.activeStyleCss = activeStyleCss;
        this.inactiveStyleCss = inactiveStyleCss;

        this.formList = [];
        this.currentStep = 0;

        this.currentForm = null;
        this.previousForm = null;

        this.stepDataCollected = {};
        this.stepDataReturned = {};

    };

    //IMPORT METHODS
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

            const sectionTitle = form.sectionList[0].firstElementChild;
            sectionTitle.appendChild(stepBox.render());

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
                form.hide_submitButton();
            });

    };

    //PROCESS METHODS
    startProcess() {

        this.currentForm = this.formList[this.currentStep];
        this.changeActiveLayout()

    };

    harvestFormData() {

        this.stepDataCollected[this.currentStep] = this.currentForm.formDataJSON;
        this.stepDataReturned = {...this.stepDataReturned, ...this.currentForm.returnedData ?? null};

    };

    moveToNextStep() {

        //process the current form
        this.harvestFormData();

        //move to next step in array
        this.currentStep ++;
        this.previousForm = this.currentForm;
        this.currentForm = this.formList[this.currentStep];

        //update display
        this.changeActiveLayout();


    };

    stepIsTheLast() {

        return this.currentStep === this.formList.length - 1;

    };
}

export {NestForm};