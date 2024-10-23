import {Calendar_BackendCall} from "../../../backendCalls/Calendar_BackendCall.js";
import {Form} from "../../../frontElements/Forms/FormBuilder/class_Form.js";
import {cssObj_AddTrackProcess} from "../../../frontElements/Forms/appForms/cssFormsInJs/cssObj_AddTrackProcess.js";
import {FormField_Date} from "../../../frontElements/Forms/FormBuilder/Fields/class_FormField_Date.js";
import {FormField_Time} from "../../../frontElements/Forms/FormBuilder/Fields/class_FormField_Time.js";
import {FormField_NumInput} from "../../../frontElements/Forms/FormBuilder/Fields/class_FormField_NumInput.js";
import {DateMethod} from "../../../../backend/Utilities/class_DateMethods.js";
import {FormField_selectField} from "../../../frontElements/Forms/FormBuilder/Fields/class_FormField_Select.js";
import {FormField_Checkbox} from "../../../frontElements/Forms/FormBuilder/Fields/FormField_Checkbox.js";
import {css} from "../../../frontElements/Forms/appForms/artistProfileForms/createArtistProfile.js";
import {TriggerList} from "../../../frontElements/Forms/FormBuilder/TriggerSystem/class_TriggerList.js";
import {TriggerField} from "../../../frontElements/Forms/FormBuilder/TriggerSystem/class_TriggerField.js";
import {FormField_textInput} from "../../../frontElements/Forms/FormBuilder/Fields/class_FormField_TextInput.js";
import {EventSettings} from "../../../init/init_appSettings.js";


export const form_addEvent = new Form({
    id: 'addEvent',
    css: 'sectionContainer',
    submitAction:  Calendar_BackendCall.POST_event
});

const sectionStyle = {
    global: 'formSection',
    header: '',
    title: cssObj_AddTrackProcess.sectionTitles,
    container: 'col gapMid'
};

//form_addEvent.addHiddenField({name: 'event_id', value: genID()})

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
        require: false,
        defaultValue: DateMethod.today
    })
});
form_addEvent.addField({
    section:'dateTimeSection',
    isDynamic: false,
    element:new FormField_Time({
        id: 'time',
        css: cssObj_AddTrackProcess.fields,
        require: false,
    })
});
form_addEvent.addField({
    section:'dateTimeSection',
    isDynamic: false,
    element: new FormField_NumInput({
        id: 'duration',
        css: cssObj_AddTrackProcess.fields,
        require: false,
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
        id: 'eventType',
        css: cssObj_AddTrackProcess.fields,
        require: true,
        name:'eventType',
        descText: 'Select Event Type',
        optionsArray: await EventSettings.eventTypes(),
        defaultValue: 'Select Event Type'
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
        customizeCheckbox:false,
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
        customizeCheckbox: false,
        cssCheckbox: 'checkbox'
    })
});

form_addEvent.addDynamicField({
    dynamicField: 'techInstall',
    destinationSection: 'addEventSection',
    previousElement: 'eventType',
    triggerList:
        new TriggerList({
            triggerList: [
                new TriggerField({
                    id: 'eventType',
                    condition: (event) => event.target.value === 'rehearsal'
                }),
            ],
            condition:'every'
        }),
});
form_addEvent.addDynamicField({
    dynamicField: 'techAssist',
    destinationSection: 'addEventSection',
    previousElement: 'techInstall',
    triggerList:
        new TriggerList({
            triggerList: [
                new TriggerField({
                    id: 'eventType',
                    condition: (event) => event.target.value === 'rehearsal'
                }),
                new TriggerField({
                    id: 'techInstall',
                    condition: (event) => event.target.checked === true
                }),
            ],
            condition:'every'
        }),
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
        id: 'staffSelectionMethod',
        css: cssObj_AddTrackProcess.fields,
        require: false,
        descText: 'Selection Method',
        optionsArray:['all', 'By category', 'one', 'custom']
    })
});
form_addEvent.addField({
    section: 'addStaffSection',
    isDynamic: true,
    element: new FormField_selectField(
        {
            id: 'selectedStaffCategory',
            css: cssObj_AddTrackProcess.fields,
            require:false,
            descText: 'Choose category',
            optionsArray:['dj', 'musician', 'dancer', 'singer'] //TODO: fonction qui recup les catégories du jour donné
        }),
})
form_addEvent.addDynamicField({
    dynamicField: 'selectedStaffCategory',
    destinationSection: 'addStaffSection',
    previousElement: 'staffSelectionMethod',
    triggerList:
        new TriggerList({
            triggerList: [
                new TriggerField({
                    id: 'staffSelectionMethod',
                    condition: (event) => event.target.value === 'By category'
                }),
            ],
            condition:'every'
        }),
});

//ADD NOTES
form_addEvent.addSection({
    id: 'addNotes',
    positionInForm: 2,
    element: {
        title: 'Description',
        style: sectionStyle
    }
});
form_addEvent.addField({
    section:'addNotes',
    isDynamic: false,
    positionInSection: 2,
    element:new FormField_textInput({
        id:'description',
        css: cssObj_AddTrackProcess.fields,
        require: false,
        placeholderContent:'Add notes'
    })
});

form_addEvent.add_submitButton('Create', '', cssObj_AddTrackProcess.submitButtons);