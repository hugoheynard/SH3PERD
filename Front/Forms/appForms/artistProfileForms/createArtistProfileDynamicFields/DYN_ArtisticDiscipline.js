import {artistBaseInfo, css} from "../createArtistProfile.js";
import {FormField_textInput} from "../../../FormBuilder/class_FormField_TextInput.js";

artistBaseInfo.addDynamicField(
    'jobCategory',

    (event) => event.target.value === 'musician',

    new FormField_textInput(
        'instrument_1',
        css,
        false,
        'instrument'
    ).render()
);