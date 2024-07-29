import {Form} from "../../FormBuilder/class_Form.js";
import {BackEndCall} from "../../../Classes/class_BackEndCalls.js";
import {FormField_textInput} from "../../FormBuilder/class_FormField_TextInput.js";
import {FormSection} from "../../FormBuilder/class_FormSection.js";

const form_createTrackContainer = new Form(
    'step_addTrack_popMenu',
        BackEndCall.POST_newTrack,
    undefined,
    undefined
    );

form_createTrackContainer.addSection({
    id:'addTrack_section',
    positionInForm: 1,
    element: new FormSection(
        {
            id:'addTrack_section',
            title: 'Add Track',
            cssSection: 'formSection'
        }
    )
})


form_createTrackContainer.addField({
    section:'addTrack_section',
    element:new FormField_textInput(
        {
            id: 'trackName',
            css: 'form_textField',
            require: true,
            placeholderContent: 'Track Name'
        }
    )
});

form_createTrackContainer.add_submitButton('Next');

export {form_createTrackContainer};