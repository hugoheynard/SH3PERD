import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {DateMethod} from "../../../../backend/Utilities/class_DateMethods.js";


export class GridBlock {
    constructor(input) {
        this.id = input.id;
        this.gridCoordinates = input.gridCoordinates;
        this._blockData = input.blockData;

        this.block = new HTMLelem('div', this.blockData._id, 'block color');
        this.html = this.block.render();
        this.html.setAttribute('draggable', true);

        this.setOnGrid(this.gridCoordinates);

        this.blockResume = new HTMLelem('div', undefined, 'block_resume').render();

        this.addDataset();
        this.addBlockResume();
    };

    setOnGrid(gridCoordinates) {
        const { rowStart, rowEnd, colStart, colEnd } = gridCoordinates;

        this.html.style.gridRowStart = rowStart;
        this.html.style.gridRowEnd = rowEnd;
        this.html.style.gridColumnStart = colStart;
        this.html.style.gridColumnEnd = colEnd;
    }

    get blockData(){
        return this._blockData;
    };

    addDataset() {
        this.html.dataset.id = this.blockData._id;
    };

    addBlockResume() {
        this.blockResume.appendChild(this.addTime(this.blockData));
        this.blockResume.appendChild(this.addBlockTitle(this.blockData));

        this.html.appendChild(this.blockResume);
    };

    addTime(block) {

        const date = new Date(block.date);

        const elemTime = document.createElement('span');
        const timeContent = document.createTextNode(`${DateMethod.standardizeTime(date.getHours())}:${DateMethod.standardizeTime(date.getMinutes())}`);

        elemTime.appendChild(timeContent);

        return elemTime;

    };

    addBlockTitle(block) {

        if(!block.content) {

            //CREATES TITLE FROM BLOCKTYPE
            const content = document.createElement('span');
            const textNode = document.createTextNode(block.type);
            content.appendChild(textNode);
            return content

        }

        //CREATES TITLE FROM CONTENT
        const title = document.createElement('span');
        const textNode = document.createTextNode(block.content.title);
        title.appendChild(textNode);
        return title;
    };

    /*
    /CREATES DESCRIPTION FROM CONTENT

    const descList = document.createElement('ol');
    descList.setAttribute('class', 'blockContentDescription');

    block.content.description.forEach(descContent => {

        const description = document.createElement('li');

        description.innerHTML += descContent;

        descList.appendChild(description)

    });

    parent.appendChild(descList);
    * */


}