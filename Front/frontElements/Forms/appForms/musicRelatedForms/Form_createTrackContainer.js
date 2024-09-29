import {Form} from "../../FormBuilder/class_Form.js";
import {BackEndCall} from "../../../../backendCalls/class_BackEndCalls.js";
import {FormField_textInput} from "../../FormBuilder/Fields/class_FormField_TextInput.js";
import {FormSection} from "../../FormBuilder/class_FormSection.js";
import {cssObj_AddTrackProcess} from "../cssFormsInJs/cssObj_AddTrackProcess.js";


const form_createTrackContainer = new Form(
    'step_addTrack_popMenu',
        BackEndCall.POST_newTrack,
    undefined,
    undefined,
    'sectionContainer'
    );

form_createTrackContainer.addSection({
    id:'addTrack_section',
    positionInForm: 1,
    element: new FormSection(
        {
            id:'addTrack_section',
            title: 'Add Track',
            cssSection: 'formSection',
            cssSectionTitle: cssObj_AddTrackProcess.sectionTitles,
            cssSectionFieldsContainer:'col gapMid'
        }
    )
})


form_createTrackContainer.addField({
    section:'addTrack_section',
    element:new FormField_textInput(
        {
            id: 'trackName',
            css: cssObj_AddTrackProcess.fields,
            require: true,
            placeholderContent: 'Track Name'
        }
    )
});

form_createTrackContainer.add_submitButton('Next', '', cssObj_AddTrackProcess.submitButtons);

export {form_createTrackContainer};