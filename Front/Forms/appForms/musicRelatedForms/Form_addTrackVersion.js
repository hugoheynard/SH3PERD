import {Form} from "../../FormBuilder/class_Form.js";
import {BackEndCall} from "../../../Classes/class_BackEndCalls.js";
import {FormField_selectField} from "../../FormBuilder/class_FormField_Select.js";
import {FormField_textInput} from "../../FormBuilder/class_FormField_TextInput.js";
import {FormField_NumInput} from "../../FormBuilder/class_FormField_NumInput.js";
import {FormAction} from "../../FormBuilder/class_FormTreeManipulation.js";
import {TriggerField} from "../../FormBuilder/class_TriggerField.js";
import {TriggerList} from "../../FormBuilder/class_TriggerList.js";

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
                descText: 'Select Type',
                optionsArray:["original", "cover", "remix", "altVersion"]
            }
        ).render()
);

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

/*DYNAMIC FIELDS*/
//TODO ON EN EST LA
new FormAction(form_addTrackVersion.formTree).addDynamicField({
    triggerList:
        new TriggerList({
            triggerList: [
                new TriggerField({
                    id: 'typeList',
                    condition: (event) => event.target.value === 'original'
                }),
                new TriggerField({
                    id: 'genreList',
                    condition: (event) => event.target.value === 'disco'
                })
            ],
            condition:'',
        }),
    dynamicField: new FormField_textInput({
            id: 'insert',
            css: 'form_textField',
            require: true,
            placeholderContent: 'insert'
    }
    ).render(),
        previousElement: 'typeList' //?? // this.triggerFieldID ou dernier liste
    }
);

form_addTrackVersion.add_submitButton('Next');

export {form_addTrackVersion};