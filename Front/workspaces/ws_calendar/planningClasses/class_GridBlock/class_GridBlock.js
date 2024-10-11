import {addBlockTitle, addTime} from "./addBlockContent.js";
import {HTMLelem} from "../../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";


export class GridBlock {
    constructor(input) {
        this.id = input.id;
        this.colCoordinates = input.colCoordinates;
        this.rowCoordinates = input.rowCoordinates;
        this._blockData = input.blockData;

        this.block = new HTMLelem('div', this.blockData._id, 'block color');
        this.html = this.block.render();
        this.html.setAttribute('draggable', true);

        this.html.style.gridColumn = this.colCoordinates;
        this.html.style.gridRowStart = this.rowCoordinates.rowStart;
        this.html.style.gridRowEnd = this.rowCoordinates.rowEnd;

        this.blockResume = new HTMLelem('div', undefined, 'block_resume').render();

        this.addDataset();
        this.addBlockResume();
    };

    get blockData(){
        return this._blockData;
    };

    addDataset() {
        this.html.dataset.id = this.blockData._id;
    };

    addBlockResume() {
        this.blockResume.appendChild(addTime(this.blockData));
        this.blockResume.appendChild(addBlockTitle(this.blockData));

        this.html.appendChild(this.blockResume);
    };

    renderBlock() {
        this.html.innerHTML = '';

        return this.html;
    };
}