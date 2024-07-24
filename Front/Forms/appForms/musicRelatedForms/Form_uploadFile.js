import {Form} from "../../FormBuilder/class_Form.js";
import {BackEndCall} from "../../../Classes/class_BackEndCalls.js";
import {FormField_FileInput} from "../../FormBuilder/class_FormField_FileInput.js";

const form_uploadFile = new Form(
    'step_addFile_popMenu',
    BackEndCall.POST_uploadFile,
    undefined,
    true,
    'sectionContainer'
    );

form_uploadFile.addSection('uploadFile_section', 'Upload File', 'formSection');

const fileInput = new FormField_FileInput(
    'inputFile',
    false,
    false
    );

fileInput.customContainer_addIcon('upload_file');
fileInput.customContainer_addTitle('Select File or drop');

form_uploadFile.addFieldToSection('uploadFile_section', fileInput.render())
form_uploadFile.add_submitButton('Next');

export {form_uploadFile};