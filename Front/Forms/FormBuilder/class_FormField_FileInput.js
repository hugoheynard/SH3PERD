import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";
import {FormField} from "./class_FormField.js";

class FormField_FileInput extends FormField{

    constructor(id, css, require, multiple = false){
        super(id, css, require);

        this._multiple = multiple;

        //this.field = this.buildField();

        this.field.setAttributes({

            'type': 'file',
            'name': 'file', // for multer identification

        });

        if(this._multiple) {
            this.field.setAttributes({'multiple':''});
        }

        this.hiddenContainer = new HTMLelem('div', id + '_field').render();
        this.hiddenContainer.style.display = "none";

        this.customContainer = new HTMLelem('div', "", 'uploadDndContainer').render();

    };

    get multiple() {
        return this._multiple;
    };

    set multiple(value) {
        this._multiple = value;
    };

    customContainer_addTitle(content) {

        const customTitle = new HTMLelem('span', '', 'uploadBoxText');
        customTitle.setText(content);

        this.field.render().addEventListener('change', () => {

            customTitle.render().innerHTML = '';

            if (this.field.render().files.length === 1) {

                customTitle.render().textContent = `${this.field.render().files.length} file selected`;

            } else if (this.field.render().files.length > 1) {

                customTitle.render().textContent = `${this.field.render().files.length} files selected`;

            } else {

                customTitle.render().textContent = 'Select File or drop';

            }

        });

        this.customContainer.appendChild(customTitle.render());

    };

    customContainer_addIcon(addIcon) {
        //TODO: trop de paramètre style en direct
        const icon = new HTMLelem('span', undefined, 'material-symbols-sharp');
        icon.setAttributes({'class': 'material-symbols-sharp'});
        icon.render().style.cursor = "pointer";
        icon.render().style.fontSize = "40px";
        icon.render().textContent = addIcon;

        icon.render().addEventListener('click', () => {

            this.field.render().click();

        });

        this.customContainer.appendChild(icon.render());

    };

    render() {

        this.hiddenContainer.appendChild(this.field.render());
        this.customContainer.appendChild(this.hiddenContainer);

        return this.customContainer;

    };

}

export {FormField_FileInput};