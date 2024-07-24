import {Form} from "../../FormBuilder/class_Form.js";
import {BackEndCall} from "../../../Classes/class_BackEndCalls.js";
import {FieldBuilder_selectField} from "../../FormBuilder/class_FormField_Select.js";
import {FormField_textInput} from "../../FormBuilder/class_FormField_TextInput.js";
import {FormField_NumInput} from "../../FormBuilder/class_FormField_NumInput.js";

const form_addTrackVersion = new Form(
    'step_addVersion_popMenu',
    BackEndCall.PUT_newVersion,
    undefined,
    undefined,
    'sectionContainer'
);

form_addTrackVersion.addSection(
    'addVersion_section',
    'Add Version',
    'formSection'
    );

form_addTrackVersion.addFieldToSection('addVersion_section',

        new FieldBuilder_selectField(
            "typeList",
            "form_textField select",
            true,
            "type",
            "Select Type",
            ["original", "cover", "remix", "altVersion"]
        ).render());

form_addTrackVersion.addFieldToSection('addVersion_section',

        new FormField_textInput(
            'Artist Name',
            true
        ).render());

form_addTrackVersion.addFieldToSection('addVersion_section',

    new FieldBuilder_selectField(
        "genreList",
        "form_textField select",
        true,
        "genre",
        "Select Genre",
        ["pop", "rock", "disco", "jazz", "soul", "dance"]
        )
        .render());

form_addTrackVersion.addFieldToSection('addVersion_section',

    new FormField_NumInput(
        'intensity',
        'form_textField',
        true,
        1,
        4,
        1
        ).render());

form_addTrackVersion.addFieldToSection('addVersion_section',

    new FormField_NumInput(
        'pitch',
        'form_textField',
        true,
        -12,
        12,
        1
        ).render());

form_addTrackVersion.add_submitButton('Next');

export {form_addTrackVersion};