import {Form} from "../../FormBuilder/class_Form.js";
import {BackEndCall} from "../../../Classes/class_BackEndCalls.js";
import {FormField_selectField} from "../../FormBuilder/class_FormField_Select.js";
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

form_addTrackVersion.addFieldToSection(
    'addVersion_section',

        new FormField_selectField(
            {
                id: "typeList",
                css:"form_textField select",
                required:false,
                name:"type",
                descText: 'Select Genre',
                optionsArray:["original", "cover", "remix", "altVersion"]
            }
        ).render()
);

/*form_addTrackVersion.addDynamicField(
    'typeList',

    (event) => event.target.value === 'original',

    new FormField_textInput(
        'insert',
        'form_textField',
        true
    ).render(),

    'typeList',
);
*/
form_addTrackVersion.addFieldToSection(
    'addVersion_section',

        new FormField_textInput(
            {
                id:'artistName',
                css:'form_textField',
                require:true,
                placeholderContent:'Artist Name'
            }
        ).render()
);

form_addTrackVersion.addFieldToSection(
    'addVersion_section',

    new FormField_selectField(
        {
            id: "genreList",
            css:"form_textField select",
            required:true,
            name:"genre",
            descText: 'Select Genre',
            optionsArray:["pop", "rock", "disco", "jazz", "soul", "dance"]
        }
        ).render()
);

form_addTrackVersion.addFieldToSection(
    'addVersion_section',

    new FormField_NumInput(
        'intensity',
        'form_textField',
        true,
        1,
        4,
        1
        ).render()
);

form_addTrackVersion.addFieldToSection(
    'addVersion_section',

    new FormField_NumInput(
        'pitch',
        'form_textField',
        true,
        -12,
        12,
        1
        ).render()
);

form_addTrackVersion.add_submitButton('Next');

export {form_addTrackVersion};