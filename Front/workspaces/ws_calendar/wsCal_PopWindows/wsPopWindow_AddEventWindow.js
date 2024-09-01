import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {Form} from "../../../frontElements/Forms/FormBuilder/class_Form.js";
import {BackEndCall} from "../../../frontElements/Classes/class_BackEndCalls.js";
import {FormSection} from "../../../frontElements/Forms/FormBuilder/class_FormSection.js";
import {cssObj_AddTrackProcess} from "../../../frontElements/Forms/appForms/cssFormsInJs/cssObj_AddTrackProcess.js";
import {FormField_selectField} from "../../../frontElements/Forms/FormBuilder/Fields/class_FormField_Select.js";
import {FormField_textInput} from "../../../frontElements/Forms/FormBuilder/Fields/class_FormField_TextInput.js";
import {FormField_NumInput} from "../../../frontElements/Forms/FormBuilder/Fields/class_FormField_NumInput.js";
import {DateMethod} from "../../../../BackEnd/Utilities/class_DateMethods.js";

const wsPopWindow_AddEvent = async () => {

    const popWindow = new HTMLelem('div', 'addEvent', '');

    const form_addEvent = new Form(
        'addEvent',
        BackEndCall.PUT_newVersion,
        undefined,
        undefined,
        'sectionContainer'
    );
    form_addEvent.addSection(
        {
            id: 'dateTimeSection',
            positionInForm: 1,
            element: new FormSection(
                {
                    id: 'dateTimeSection',
                    title: 'Date / Time',
                    cssSection: 'formSection',
                    cssSectionHeader: '',
                    cssSectionTitle: cssObj_AddTrackProcess.sectionTitles,
                    cssSectionFieldsContainer:'col gapMid'
                })
        });

    //TODO: Form datetime
    form_addEvent.addField(
        {
            section:'dateTimeSection',
            element:new FormField_NumInput(
                {
                    id: 'duration',
                    css: cssObj_AddTrackProcess.fields,
                    require: true,
                    min: 5,
                    max: 720,
                    step: DateMethod.STEP_DURATION
                }
            )
        }
    );


    form_addEvent.addSection(
        {
            id: 'addEventSection',
            positionInForm: 2,
            element: new FormSection(
                {
                    id: 'addEventSection',
                    title: 'Event',
                    cssSection: 'formSection',
                    cssSectionHeader: '',
                    cssSectionTitle: cssObj_AddTrackProcess.sectionTitles,
                    cssSectionFieldsContainer:'col gapMid'
                })
        });
    /*
    form_addEvent.addField(
        {
            section:'addEventSection',
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
    */
    form_addEvent.addField(
        {
            section: 'addEventSection',
            positionInSection: 1,
            element: new FormField_selectField(
                {
                    id: 'typeList',
                    css: cssObj_AddTrackProcess.fields,
                    require:false,
                    name:'eventType',
                    descText: 'Select Event Type',
                    optionsArray:['show', 'rehearsal', 'meeting']
                    }
                )
            }
        );

    form_addEvent.addSection(
        {
            id: 'addStaffSection',
            positionInForm: 2,
            element: new FormSection(
                {
                    id: 'addStaffSection',
                    title: 'Staff',
                    cssSection: 'formSection',
                    cssSectionHeader: '',
                    cssSectionTitle: cssObj_AddTrackProcess.sectionTitles,
                    cssSectionFieldsContainer:'col gapMid'
                })
        });

    form_addEvent.addSection(
        {
            id: 'addNotes',
            positionInForm: 2,
            element: new FormSection(
                {
                    id: 'addNotes',
                    title: 'Description',
                    cssSection: 'formSection',
                    cssSectionHeader: '',
                    cssSectionTitle: cssObj_AddTrackProcess.sectionTitles,
                    cssSectionFieldsContainer:'col gapMid'
                })
        });

    form_addEvent.add_submitButton('Create', '', cssObj_AddTrackProcess.submitButtons);


    popWindow.render().appendChild(form_addEvent.render())


    return popWindow.render()

};

export {wsPopWindow_AddEvent}