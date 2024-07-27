import {NestForm} from "../../FormBuilder/class_NestForm.js";
import {form_uploadFile} from "./Form_uploadFile.js";
import {form_createTrackContainer} from "./Form_createTrackContainer.js";
import {form_addTrackVersion} from "./Form_addTrackVersion.js";

const addTrackProcess = async () => {

    const nest = new NestForm(

        'activeForm',
        'inactiveForm'
    );

    nest.addForm(form_createTrackContainer);
    nest.addForm(form_addTrackVersion);
    //nest.addForm(form_uploadFile);

    nest.addStepBoxInSections('stepBox');

    nest.startProcess();


    for (const nestedFormElement of nest.formList) {

        popMenu.appendChild(nestedFormElement.render())
    }


};

export {addTrackProcess};