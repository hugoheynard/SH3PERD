import {NestForm} from "../../FormBuilder/Nest/class_NestForm.js";
import {Form} from "../../FormBuilder/class_Form.js";
import {FormField_textInput} from "../../FormBuilder/Fields/class_FormField_TextInput.js";
import {FormField_selectField} from "../../FormBuilder/Fields/class_FormField_Select.js";
import {FormField_Checkbox} from "../../FormBuilder/Fields/FormField_Checkbox.js";
import {FormSection} from "../../FormBuilder/class_FormSection.js";
import {HTMLelem} from "../../../Classes/HTMLClasses/class_HTMLelem.js";


const artistBaseInfo = new Form(
    'artistBaseInfos',
    '',
    undefined,
    false,
    'form col',
    ''
);

const cssSection = 'col gapMid';
const cssHeader = 'row spaceBetween';
const cssTitle = 'form_sectionTitle';
const cssSecFieldContainer = 'row gapMid wrap';

const css = 'field textField widthMid avg borderRoundLight capital'

/*PERSONAL DETAILS*/
artistBaseInfo.addSection(
    {
        id:'artistBaseInfos',
        positionInForm: 1,
        element: new FormSection(
            {
                id:'artistBaseInfos',
                title:'personal details',
                cssSection:cssSection,
                cssSectionHeader:cssHeader,
                cssSectionTitle:cssTitle,
                cssSectionFieldsContainer:cssSecFieldContainer
            }
            )
    }
);

artistBaseInfo.addField(
    {
        section:'artistBaseInfos',
        positionInSection: 1,
        element:new FormField_textInput(
            {
                id: 'lastName',
                css: css,
                require: false,
                placeholderContent: 'last name'
            }
        )
    }
);

artistBaseInfo.addField(
    {
        section:'artistBaseInfos',
        positionInSection: 2,
        element:new FormField_textInput(
            {
                id: 'firstName',
                css: css,
                require: false,
                placeholderContent: 'first name'
            }
        )
    }
);

artistBaseInfo.addField(
    {
        section:'artistBaseInfos',
        positionInSection: 3,
        element: new FormField_textInput(
            {
                id: 'artistName',
                css: css,
                require: false,
                placeholderContent: 'artist name'
            }
        )
    }
);

/*JOB INFORMATION*/
artistBaseInfo.addSection(
    {
        id:'artistJobInfos',
        positionInForm: 2,
        element: new FormSection(
            {
                id:'artistJobInfos',
                title:'functions',
                cssSection:cssSection,
                cssSectionHeader:cssHeader,
                cssSectionTitle:cssTitle,
                cssSectionFieldsContainer:cssSecFieldContainer
            })
    }
);

artistBaseInfo.addField(
    {
        section:'artistJobInfos',
        positionInSection: 1,
        element: new FormField_selectField(
            {
                id:'jobCategory',
                css:css,
                required:false,
                name:'category',
                descType:'artistic discipline',
                optionsArray:['dj', 'musician', 'dancer', 'other']
            },
        )
    }
);


artistBaseInfo.addField(
    {
        section: 'artistJobInfos',
        positionInSection: 2,
        element: new FormField_Checkbox(
            {
                id:'techRole',
                cssContainer: css +' row spaceBetween ',
                require: false,
                label: 'tech Role',
                cssLabel: undefined,
                customizeCheckbox:false,
                cssCheckbox:'checkbox'
            }
        )
    }
);

artistBaseInfo.addField(
    {
        section:'artistJobInfos',
        positionInSection: 3,
        element:new FormField_Checkbox(
            {
                id: 'managementRole',
                cssContainer: css + ' row spaceBetween ',
                require: false,
                label: 'management Role',
                cssLabel: undefined,
                customizeCheckbox: false,
                cssCheckbox: 'checkbox'
            }
        )
    }
);

/*
artistBaseInfo.addField('artistJobInfos', new FormField_selectField(
        'jobCategory',
        css,
        false,
        'corporateFunction',
        'corporate Role',
        ['dj', 'musician', 'dancer', 'other'],
    ).render()
);
*/


/*CONTACT*/
artistBaseInfo.addSection(
    {
        id:'artistContactInfos',
        positionInForm: 3,
        element: new FormSection(
            {
                id:'artistContactInfos',
                title:'Contact Informations',
                cssSection:cssSection,
                cssSectionHeader:cssHeader,
                cssSectionTitle:cssTitle,
                cssSectionFieldsContainer:cssSecFieldContainer
            }
        )
    }
);


artistBaseInfo.addField(
    {
        section: 'artistContactInfos',
        positionInSection: 1,
        element: new FormField_textInput(
            {
                id: 'mail',
                css: css,
                require: false
            }
        )
    }
);

artistBaseInfo.addField({
        section:'artistContactInfos',
        positionInSection: 2,
        element: new FormField_textInput(
            {
                id: 'telephone',
                css: css,
                require: false
            }
        )
    }
);

artistBaseInfo.add_submitButton('CREATE', 'button_submitForm_inPopMenu')

const createArtistProfile = () => {

    const container = new HTMLelem('div', 'artistInfos').render();

    const nest = new NestForm(
        {
            formList: [artistBaseInfo],
            destination: container,
            activeStyleCss: '',
            inactiveStyleCss: '',
            displayStepBox: false,
            steboxCss: 'stepBox'
        });

    //nest.startProcess();

    for (const nestedFormElement of nest.formList) {

        container.appendChild(nestedFormElement.render())
    }

    //nest.addStepBoxInSections('stepBox')

    console.log(container)
    return container
}

export {createArtistProfile, artistBaseInfo, css};