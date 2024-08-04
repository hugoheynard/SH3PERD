import {NestForm} from "../../FormBuilder/Nest/class_NestForm.js";
import {form_uploadFile} from "./Form_uploadFile.js";
import {form_createTrackContainer} from "./Form_createTrackContainer.js";
import {form_addTrackVersion} from "./Form_addTrackVersion.js";


const addTrackProcess = async () => {

    const nest = new NestForm(

        {
            formList: [form_createTrackContainer, form_addTrackVersion, form_uploadFile],
            destination: popMenu,
            activeStyleCss: 'activeForm',
            inactiveStyleCss: 'inactiveForm',
            displayStepBox: false,
            steboxCss: 'stepBox'
        });

    nest.startProcess();
};

export {addTrackProcess};