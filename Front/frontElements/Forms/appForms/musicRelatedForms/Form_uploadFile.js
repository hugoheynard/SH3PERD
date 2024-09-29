import {Form} from "../../FormBuilder/class_Form.js";
import {BackEndCall} from "../../../../backendCalls/class_BackEndCalls.js";
import {FormField_FileInput} from "../../FormBuilder/Fields/class_FormField_FileInput.js";
import {FormSection} from "../../FormBuilder/class_FormSection.js";
import {cssObj_AddTrackProcess} from "../cssFormsInJs/cssObj_AddTrackProcess.js";


const form_uploadFile = new Form(
    'step_addFile_popMenu',
    BackEndCall.POST_uploadMusicFile,
    undefined,
    true,
    'sectionContainer',
    '',
    );

form_uploadFile.addSection(
    {
        id: 'uploadFile_section',
        positionInForm: 1,
        element: new FormSection(
            {
                id: 'uploadFile_section',
                title: 'Upload File',
                cssSection: 'formSection',
                cssSectionTitle: cssObj_AddTrackProcess.sectionTitles,
            }
        )
    }
);

const fileInput = new FormField_FileInput(
    'inputFile',
    '',
    false,
    false,
    );

fileInput.customContainer_addIcon('upload_file');
fileInput.customContainer_addTitle('Select File or drop');

form_uploadFile.addField(
    {
        section: 'uploadFile_section',
        positionInSection: 1,
        element: fileInput
    });

form_uploadFile.add_submitButton('Next', '', cssObj_AddTrackProcess.submitButtons);

export {form_uploadFile};