import {Form} from "../../FormBuilder/class_Form.js";
import {FormField_textInput} from "../../FormBuilder/Fields/class_FormField_TextInput.js";
import {FormField_selectField} from "../../FormBuilder/Fields/class_FormField_Select.js";
import {FormField_NumInput} from "../../FormBuilder/Fields/class_FormField_NumInput.js";

const form_createPlaylist = new Form(
    'createPlaylist',
    () => console.log('creation'),
    null,
    );

form_createPlaylist.addSection(
    'createPlaylist',
    'Create Playlist',
    'formSection'
);

form_createPlaylist.addFieldToSection(
    'createPlaylist',

    new FormField_textInput(
        'playlistName',
        true,
        'Playlist Name',
        'form_textField'
    )
);

form_createPlaylist.addFieldToSection(
    'createPlaylist',

    new FormField_selectField(
        'playlistType',
        true,
        true,
        'playlistType',
        'Select Type',
        ['PBO', 'CAB']
    )
);

//TODO: faire la fonction qui permet d'ajouter un champ dynamique -> if PBO
form_createPlaylist.addFieldToSection(
    'createPlaylist',

    new FormField_selectField(
        'playlistSubType',
        true,
        true,
        'playlistSubType',
        'Select Type',
        ['Lounge', 'UpTempo', 'Club']
    )
);

form_createPlaylist.addFieldToSection(
    'createPlaylist',

    new FormField_NumInput(
        "playlistIntensity",
        'form_textField',
        true,
        1,
        4,
        1
    )
);

form_createPlaylist.add_submitButton('Create');

export {form_createPlaylist};