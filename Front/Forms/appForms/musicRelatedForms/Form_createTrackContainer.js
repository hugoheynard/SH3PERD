import {Form} from "../../FormBuilder/class_Form.js";
import {BackEndCall} from "../../../Classes/class_BackEndCalls.js";
import {FormField_textInput} from "../../FormBuilder/class_FormField_TextInput.js";

const form_createTrackContainer = new Form(
    'step_addTrack_popMenu',
        BackEndCall.POST_newTrack
    );

form_createTrackContainer.addSection(
    'addTrack_section',
    'Add Track',
    'formSection'
    );

form_createTrackContainer.addFieldToSection('addTrack_section',

    new FormField_textInput(
        'Track Name',
        true
        ).render()
    );

form_createTrackContainer.add_submitButton('Next');

export {form_createTrackContainer};