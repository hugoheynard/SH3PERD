import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";

class FormField_FileInput {

    constructor(id, require, multiple){

        this.id = id;
        this.require = require;
        this.multiple = multiple;

        this.inputField = new HTMLelem('input', this.id, 'form_textField');

        this.inputField.setAttributes({

            'type': 'file',
            'name': 'file', // for multer identification
            ...(this.require ? { 'required': '' } : {}),
            ...(this.multiple ? { 'multiple': '' } : {})

        });


        this.container = new HTMLelem('div', id + '_field').render();
        this.customContainer = new HTMLelem('div', "", 'uploadDndContainer').render();

    };


    customContainer_addTitle(content) {

        const customTitle = new HTMLelem('span', '', 'uploadBoxText');
        customTitle.setText(content);

        this.inputField.render().addEventListener('change', () => {

            customTitle.render().innerHTML = '';

            if (this.inputField.render().files.length === 1) {

                customTitle.render().textContent = `${this.inputField.render().files.length} file selected`;

            } else if (this.inputField.render().files.length > 1) {

                customTitle.render().textContent = `${this.inputField.render().files.length} files selected`;

            } else {

                customTitle.render().textContent = 'Select File or drop';

            }

        });

        this.customContainer.appendChild(customTitle.render());

    };


    customContainer_addIcon(addIcon) {

        const icon = new HTMLelem('span', undefined, 'material-symbols-sharp');
        icon.setAttributes({'class': 'material-symbols-sharp'});
        icon.render().style.cursor = "pointer";
        icon.render().style.fontSize = "40px";
        icon.render().textContent = 'upload_file';

        icon.render().addEventListener('click', () => {

            this.inputField.render().click();

        });

        this.customContainer.appendChild(icon.render());

    };

    render() {

        this.customContainer.appendChild(this.inputField.render());

        return this.customContainer;

    };

}

export {FormField_FileInput};