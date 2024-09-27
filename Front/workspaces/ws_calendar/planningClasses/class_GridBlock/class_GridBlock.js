import {addBlockTitle, addTime} from "./addBlockContent.js";
import {HTMLelem} from "../../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";


class GridBlock {
    constructor(input) {
        this._blockData = input.blockData;

        this.block = new HTMLelem('div', undefined, 'block color');
        this.htmlElement = this.block.render();
        this.htmlElement.setAttribute('draggable', true);
        this.blockResume = new HTMLelem('div', undefined, 'block_resume').render();

        this.addDataset();
        this.addBlockResume();
    };

    get blockData(){
        return this._blockData;
    };

    addDataset() {
        this.htmlElement.dataset.id = this.blockData._id;
        this.htmlElement.dataset.type = this.blockData.type;
    };

    addBlockResume() {
        this.blockResume.appendChild(addTime(this.blockData));
        this.blockResume.appendChild(addBlockTitle(this.blockData));

        this.htmlElement.appendChild(this.blockResume);
    };

    renderBlock() {
        this.htmlElement.innerHTML = '';

        return this.htmlElement;
    };
}

export {GridBlock};