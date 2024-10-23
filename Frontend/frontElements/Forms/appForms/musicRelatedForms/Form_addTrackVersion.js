import {Form} from "../../FormBuilder/class_Form.js";
import {BackEndCall} from "../../../../backendCalls/BackEndCalls.js";
import {FormSection} from "../../FormBuilder/class_FormSection.js";
import {FormField_selectField} from "../../FormBuilder/Fields/class_FormField_Select.js";
import {FormField_textInput} from "../../FormBuilder/Fields/class_FormField_TextInput.js";
import {FormField_NumInput} from "../../FormBuilder/Fields/class_FormField_NumInput.js";
import {TriggerField} from "../../FormBuilder/TriggerSystem/class_TriggerField.js";
import {TriggerList} from "../../FormBuilder/TriggerSystem/class_TriggerList.js";
import {cssObj_AddTrackProcess} from "../cssFormsInJs/cssObj_AddTrackProcess.js";


const form_addTrackVersion = new Form(
    'step_addVersion_popMenu',
    BackEndCall.PUT_newVersion,
    undefined,
    undefined,
    'sectionContainer'
);

form_addTrackVersion.addSection(
    {
        id: 'addVersion_section',
        positionInForm: 1,
        element: new FormSection(
            {
                id: 'addVersion_section',
                title: 'Add Version',
                cssSection: 'formSection',
                cssSectionHeader: '',
                cssSectionTitle: cssObj_AddTrackProcess.sectionTitles,
                cssSectionFieldsContainer:'col gapMid'
            }
        )
    }
);

form_addTrackVersion.addField(
    {
        section: 'addVersion_section',
        positionInSection: 1,
        element: new FormField_selectField(
            {
                id: 'typeList',
                css: cssObj_AddTrackProcess.fields,
                require:false,
                name:"type",
                descText: 'Select Type',
                optionsArray:["original", "cover", "remix", "altVersion"]
            }
        )
    }
);

form_addTrackVersion.addField(
    {
        section:'addVersion_section',
        positionInSection: 2,
        element:new FormField_textInput(
            {
                id:'artistName',
                css: cssObj_AddTrackProcess.fields,
                require:true,
                placeholderContent:'Artist Name'
            }
        )
    }
);

form_addTrackVersion.addField(
    {
        section:'addVersion_section',
        element:new FormField_selectField(
            {
                id: 'genreList',
                css: cssObj_AddTrackProcess.fields,
                require: true,
                name: "genre",
                descText: 'Select Genre',
                optionsArray: ["pop", "rock", "disco", "jazz", "soul", "dance"]
            }
        )
    }
);

form_addTrackVersion.addField(
    {
        section:'addVersion_section',
        element:new FormField_NumInput(
            {
                id:'intensity',
                css: cssObj_AddTrackProcess.fields,
                require: true,
                min: 1,
                max: 4,
                step: 1
            }
        )
    }
);

form_addTrackVersion.addField(
    {
        section:'addVersion_section',
        element:new FormField_NumInput(
            {
                id: 'pitch',
                css: cssObj_AddTrackProcess.fields,
                require: true,
                min: - 12,
                max: 12,
                step: 1
            }
        )
    }
);

/*DYNAMIC FIELDS*/

form_addTrackVersion.addDynamicField({
    triggerList:
        new TriggerList(
            {
                triggerList: [
                    new TriggerField(
                    {
                        id: 'typeList',
                        condition: (event) => event.target.value === 'original'
                        }),
                    new TriggerField(
                    {
                        id: 'genreList',
                        condition: (event) => event.target.value === 'disco'
                        })
                ],
                condition:'every',
            }),
    dynamicField: new FormField_textInput(
        {
            id: 'insert',
            css: cssObj_AddTrackProcess.fields,
            require: true,
            placeholderContent: 'insert'
        }),
        destinationSection: 'addVersion_section',
        previousElement: 'typeList'
    }
);

form_addTrackVersion.add_submitButton('Next', '', cssObj_AddTrackProcess.submitButtons);



export {form_addTrackVersion};