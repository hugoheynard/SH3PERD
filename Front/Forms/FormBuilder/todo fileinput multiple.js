import {FormField_textInput} from "./class_FormField_TextInput.js";
//TODO: intégrer la gestion dynamique du renommage de fichier dans form field input
const uploadFormBuild = () => {

    //CREATE FORM
    //const inputForm = add_uploadForm();
    document.getElementById('uploadSection').appendChild(inputForm);

    //ADDS DND CONTAINER
    //inputForm.appendChild(add_uploadFileContainer())

    const inputFile = document.getElementById('inputFile');



    //generates field for db entrie
    inputFile.addEventListener('change', (event) => {

        // Clear any existing text fields
        const textFieldContainer = document.createElement('div');
        textFieldContainer.setAttribute('id','textFieldContainer');
        textFieldContainer.setAttribute('class', 'sectionContainer');
        //inputForm.appendChild(textFieldContainer)
        textFieldContainer.innerHTML = '';

        textFieldContainer.appendChild(add_FormSectionTitle('track Infos'))

        // Get the list of selected files
        const files = Array.from(event.target.files);

        // Create a text field for each file
        for (const file of files) {

            const description = document.createElement('span');
            description.appendChild(document.createTextNode(`Description for ${file.name}:`));

            //middleware -> artist logged is default artist performing song
            textFieldContainer.appendChild(description)
            textFieldContainer.appendChild(new FormField_textInput('trackName', 'track name', true).render());
            //textFieldContainer.appendChild( new FormField_textInput('originalArtist', 'original artist', false).render());

        }

    });

};

export {uploadFormBuild};