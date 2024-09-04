import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {Form} from "../../../frontElements/Forms/FormBuilder/class_Form.js";
import {BackEndCall} from "../../../frontElements/Classes/class_BackEndCalls.js";
import {cssObj_AddTrackProcess} from "../../../frontElements/Forms/appForms/cssFormsInJs/cssObj_AddTrackProcess.js";
import {FormField_selectField} from "../../../frontElements/Forms/FormBuilder/Fields/class_FormField_Select.js";
import {FormField_textInput} from "../../../frontElements/Forms/FormBuilder/Fields/class_FormField_TextInput.js";
import {FormField_NumInput} from "../../../frontElements/Forms/FormBuilder/Fields/class_FormField_NumInput.js";
import {DateMethod} from "../../../../BackEnd/Utilities/class_DateMethods.js";
import {FormField_Date} from "../../../frontElements/Forms/FormBuilder/Fields/class_FormField_Date.js";
import {FormField_Time} from "../../../frontElements/Forms/FormBuilder/Fields/class_FormField_Time.js";
import {TriggerList} from "../../../frontElements/Forms/FormBuilder/TriggerSystem/class_TriggerList.js";
import {TriggerField} from "../../../frontElements/Forms/FormBuilder/TriggerSystem/class_TriggerField.js";
import {FormField_Checkbox} from "../../../frontElements/Forms/FormBuilder/Fields/FormField_Checkbox.js";
import {css} from "../../../frontElements/Forms/appForms/artistProfileForms/createArtistProfile.js";


const wsPopWindow_AddEvent = async () => {
    const popWindow = new HTMLelem('div', 'addEvent', '');

    const form_addEvent = new Form({
        id: 'addEvent',
        css: 'sectionContainer',
        submitAction:  BackEndCall.POST_AddEvent,
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
    form_addEvent.addDynamicField({
        dynamicField: 'techInstall',
        destinationSection: 'addEventSection',
        previousElement: 'eventTypeList',
        triggerList:
            new TriggerList({
                triggerList: [
                    new TriggerField({
                        id: 'eventTypeList',
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
                        id: 'eventTypeList',
                        condition: (event) => event.target.value === 'rehearsal'
                    }),
                    new TriggerField({
                        id: 'techInstall',
                        condition: (event) => event.target.checked
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
    form_addEvent.addDynamicField({
        dynamicField: 'selectCategory',
        destinationSection: 'addStaffSection',
        previousElement: 'selectionMethod',
            triggerList:
                new TriggerList({
                    triggerList: [
                        new TriggerField({
                            id: 'selectionMethod',
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
                require:true,
                placeholderContent:'Add notes'
        })
    });

    form_addEvent.add_submitButton('Create', '', cssObj_AddTrackProcess.submitButtons);


    popWindow.render().appendChild(form_addEvent.render())


    return popWindow.render()

};

export {wsPopWindow_AddEvent}