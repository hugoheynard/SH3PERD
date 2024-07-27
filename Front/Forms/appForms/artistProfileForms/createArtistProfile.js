import {NestForm} from "../../FormBuilder/class_NestForm.js";
import {Form} from "../../FormBuilder/class_Form.js";
import {FormField_textInput} from "../../FormBuilder/class_FormField_TextInput.js";
import {FormField_selectField} from "../../FormBuilder/class_FormField_Select.js";
import {FormField_Checkbox} from "../../FormBuilder/FormField_Checkbox.js";

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
artistBaseInfo.addSection('artistBaseInfos',
    'personal details',
    cssSection,
    cssHeader,
    cssTitle,
    cssSecFieldContainer
);

artistBaseInfo.addFieldToSection('artistBaseInfos', new FormField_textInput(
        'lastName', css,
        false,
        'last name'
    ).render()
);

artistBaseInfo.addFieldToSection('artistBaseInfos', new FormField_textInput(
        'firstName', css,
        false,
    'first name'
    ).render()
);

artistBaseInfo.addFieldToSection('artistBaseInfos', new FormField_textInput(
        'artistName', css,
        false,
    'artist name'
    ).render()
);

/*JOB INFORMATION*/
artistBaseInfo.addSection('artistJobInfos',
    'Functions',
    cssSection,
    cssHeader,
    cssTitle,
    cssSecFieldContainer

);

artistBaseInfo.addFieldToSection('artistJobInfos', new FormField_selectField(
        'jobCategory',
        css,
        false,
        'category',
        'artistic discipline',
        ['dj', 'musician', 'dancer', 'other'],
    ).render()
);


artistBaseInfo.addFieldToSection('artistJobInfos', new FormField_Checkbox(
    'techRole',
    css + ' row spaceBetween ',
    false,
    'tech Role',
    undefined,
    false,
    'checkbox'
    ).render()
);

artistBaseInfo.addFieldToSection('artistJobInfos', new FormField_Checkbox(
        'managementRole',
        css + ' row spaceBetween ',
        false,
        'management Role',
        undefined,
        false,
        'checkbox'
    ).render()
);

/*
artistBaseInfo.addFieldToSection('artistJobInfos', new FormField_selectField(
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
artistBaseInfo.addSection('artistContactInfos',
    'Contact Informations',
    cssSection,
    cssHeader,
    cssTitle,
    cssSecFieldContainer
);


artistBaseInfo.addFieldToSection('artistContactInfos', new FormField_textInput(
        'mail', css,
        false
    ).render()
);

artistBaseInfo.addFieldToSection('artistContactInfos', new FormField_textInput(
        'telephone', css,
        false
    ).render()
);

artistBaseInfo.add_submitButton('CREATE', 'button_submitForm_inPopMenu')


const createArtistProfile = () => {

    document.getElementById('appElements').innerHTML = '';

    const nest = new NestForm('', '');

    nest.addForm(artistBaseInfo)

    //nest.startProcess();

    for (const nestedFormElement of nest.formList) {

        document.getElementById('appElements').appendChild(nestedFormElement.render())
    }

    nest.addStepBoxInSections('stepBox')

}

export {createArtistProfile, artistBaseInfo, css};