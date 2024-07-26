import {NestForm} from "../../FormBuilder/class_NestForm.js";
import {Form} from "../../FormBuilder/class_Form.js";
import {FormField_textInput} from "../../FormBuilder/class_FormField_TextInput.js";
import {FormField_selectField} from "../../FormBuilder/class_FormField_Select.js";

const artistBaseInfo = new Form(
    'artistBaseInfos',
    '',
    undefined,
    false,
    'form col',
    ''

)

artistBaseInfo.addSection('artistBaseInfos', 'Artist Infos', 'section row')

const css = 'field textField mid avg borderRoundLight capital'


artistBaseInfo.addFieldToSection(
    'artistBaseInfos',

    new FormField_textInput(
        'lastName', css,
        false
    ).render()
);

artistBaseInfo.addFieldToSection(
    'artistBaseInfos',

    new FormField_textInput(
        'firstName', css,
        false
    ).render()
);

artistBaseInfo.addFieldToSection(
    'artistBaseInfos',

    new FormField_textInput(
        'artistName', css,
        false
    ).render()
)

artistBaseInfo.addSection('artistJobInfos', 'Functions', 'section row');

artistBaseInfo.addFieldToSection(
    'artistJobInfos',

    new FormField_selectField(
        'jobCategory',
        css,
        false,
        'category',
        'artistic discipline',
        ['dj', 'musician', 'dancer', 'other'],
    ).render()
)

artistBaseInfo.addFieldToSection(
    'artistJobInfos',

    new FormField_selectField(
        'jobCategory',
        css,
        false,
        'corporateFunction',
        'corporate Role',
        ['dj', 'musician', 'dancer', 'other'],
    ).render()
)

artistBaseInfo.addSection('artistContactInfos', 'Contact Informations', 'section row')
artistBaseInfo.addFieldToSection(
    'artistContactInfos',

    new FormField_textInput(
        'mail', css,
        true
    ).render()
)

artistBaseInfo.addFieldToSection(
    'artistContactInfos',

    new FormField_textInput(
        'telephone', css,
        false
    ).render()
)

artistBaseInfo.add_submitButton('CREATE', 'button_submitForm_inPopMenu')


const createArtistProfile = () => {

    document.getElementById('appElements').innerHTML = '';

    const nest = new NestForm('', '');

    nest.addForm(artistBaseInfo)




    //nest.startProcess();



    for (const nestedFormElement of nest.formList) {

        document.getElementById('appElements').appendChild(nestedFormElement.render())
    }

    //nest.addStepBoxInSections('stepBox')

}

export {createArtistProfile};