import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {Form} from "../../../frontElements/Forms/FormBuilder/class_Form.js";
import {BackEndCall} from "../../../frontElements/Classes/class_BackEndCalls.js";
import {cssObj_AddTrackProcess} from "../../../frontElements/Forms/appForms/cssFormsInJs/cssObj_AddTrackProcess.js";
import {FormField_Date} from "../../../frontElements/Forms/FormBuilder/Fields/class_FormField_Date.js";
import {FormField_Time} from "../../../frontElements/Forms/FormBuilder/Fields/class_FormField_Time.js";
import {FormField_NumInput} from "../../../frontElements/Forms/FormBuilder/Fields/class_FormField_NumInput.js";
import {DateMethod} from "../../../../BackEnd/Utilities/class_DateMethods.js";
import {FormField_selectField} from "../../../frontElements/Forms/FormBuilder/Fields/class_FormField_Select.js";
import {FormField_Checkbox} from "../../../frontElements/Forms/FormBuilder/Fields/FormField_Checkbox.js";
import {css} from "../../../frontElements/Forms/appForms/artistProfileForms/createArtistProfile.js";
import {TriggerList} from "../../../frontElements/Forms/FormBuilder/TriggerSystem/class_TriggerList.js";
import {TriggerField} from "../../../frontElements/Forms/FormBuilder/TriggerSystem/class_TriggerField.js";
import {FormField_textInput} from "../../../frontElements/Forms/FormBuilder/Fields/class_FormField_TextInput.js";

const wsPopWindow_AddTimeframe = async () => {
    const popWindow = new HTMLelem('div', 'addEvent', '');

    //triggers the creation of an instance of TimeFrame
    //-> date -> visual pops a preview layer border only whole day
    //-> starttime -> visual narrows from starttime
    //duration -> visual narrows from endtime

    const form_addEvent = new Form({
        id: 'addTimeframe',
        css: 'sectionContainer',
        submitAction:  BackEndCall.POST_AddTimeframe,
    });

    const sectionStyle = {
        global: 'formSection',
        header: '',
        title: cssObj_AddTrackProcess.sectionTitles,
        container: 'col gapMid'
    };

    form_addEvent.addHiddenField({name: 'eventID', value: ''})

    form_addEvent.addSection({
        id: 'dateTimeSection',
        positionInForm: 1,
        element: {
            title: 'Date / Time',
            style: sectionStyle,
        }
    });
    form_addEvent.addField({
        section:'dateTimeSection',
        isDynamic: false,
        element:new FormField_Date({
            id: 'date',
            css: cssObj_AddTrackProcess.fields,
            require: true,
        })
    });
    form_addEvent.addField({
        section:'dateTimeSection',
        isDynamic: false,
        element:new FormField_Time({
            id: 'time',
            css: cssObj_AddTrackProcess.fields,
            require: true,
        })
    });
    form_addEvent.addField({
        section:'dateTimeSection',
        isDynamic: false,
        element: new FormField_NumInput({
            id: 'duration',
            css: cssObj_AddTrackProcess.fields,
            require: true,
            min: 5,
            max: 720,
            step: DateMethod.STEP_DURATION
        })
    });

    /*EVENT SECTION*/
    form_addEvent.addSection({
        id: 'addEventSection',
        positionInForm: 2,
        element: {
            title: 'Event',
            style: sectionStyle
        }
    });
    form_addEvent.addField({
        section: 'addEventSection',
        isDynamic: false,
        positionInSection: 1,
        element: new FormField_selectField({
            id: 'eventTypeList',
            css: cssObj_AddTrackProcess.fields,
            require:false,
            name:'eventType',
            descText: 'Select Event Type',
            optionsArray:['show', 'rehearsal', 'meeting']
        })
    });
    form_addEvent.addField({
        section: 'addEventSection',
        isDynamic: true,
        positionInSection: 1,
        element: new FormField_Checkbox({
            id:'techInstall',
            cssContainer: css +' row spaceBetween ',
            require: false,
            label: 'tech install',
            cssLabel: undefined,
            customizeCheckbox:true,
            cssCheckbox:'checkbox'
        }),
    });
    form_addEvent.addField({
        section: 'addEventSection',
        isDynamic: true,
        element: new FormField_Checkbox({
            id: 'techAssist',
            cssContainer: css + ' row spaceBetween ',
            require: false,
            label: 'tech assist',
            cssLabel: undefined,
            customizeCheckbox: true,
            cssCheckbox: 'checkbox'
        })
    });


    /*Add Staff Section*/
    form_addEvent.addSection({
        id: 'addStaffSection',
        positionInForm: 2,
        element: {
            title: 'Staff',
            style: sectionStyle,
        }
    });
    form_addEvent.addField({
        section: 'addStaffSection',
        positionInSection: 1,
        element: new FormField_selectField({
            id: 'selectionMethod',
            css: cssObj_AddTrackProcess.fields,
            require: false,
            name:'selectionMethod',
            descText: 'Selection Method',
            optionsArray:['all', 'By category', 'one', 'custom']
        })
    });
    form_addEvent.addField({
        section: 'addStaffSection',
        isDynamic: true,
        element: new FormField_selectField(
            {
                id: 'selectCategory',
                css: cssObj_AddTrackProcess.fields,
                require:false,
                name:'selectCategory',
                descText: 'Choose category',
                optionsArray:['dj', 'musician', 'dancer', 'singer'] //TODO: fonction qui recup les catégories du jour donné
            }),
    })



    form_addEvent.add_submitButton('Create', '', cssObj_AddTrackProcess.submitButtons);


    popWindow.render().appendChild(form_addEvent.render())


    return popWindow.render()

};

export {wsPopWindow_AddTimeframe}