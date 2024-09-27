import {GridBlock} from "./class_GridBlock/class_GridBlock.js";
import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {getPositionFromDate, getRowEndFromDatasetDuration} from "../../../Utilities/dataset_functions/datasetFunctions.js";


export class IndividualPlanning {
    constructor (input) {
        this.id = input.id;
        this.negativeOffset = input.negativeOffset;

        this.artistBlockList = input.calendar_events;
        this.gridBlockArray = [];

        this.planning = new HTMLelem('div', this.id, 'dailyPlanningCalendar').render();
        //this.backgroundColor = input.backgroundOverlay;

        //sets the grid
        this.maxElemInRow = this.getMaxElemInRow() ?? 1;
        this.numberOfCol = this.defineColumnTemplate();
        this.planning.style.gridTemplateColumns = `repeat(${this.numberOfCol}, 1fr)`;
        this.planning.style.gridTemplateRows = `repeat(${input.numberOfRows}, ${input.rowSize}px)`;
    };

    getMaxElemInRow() {
        return 1 + Math.max(...this.artistBlockList.map(event => event.collisionList.length));
    };

    defineColumnTemplate() {
        if (this.maxElemInRow % 2 !== 0) {
            return this.maxElemInRow * 2;
        }
        return this.maxElemInRow;
    };

    //GRID BLOCKS METHODS
    addRowCoordinates(block) {
        const rowStart = getPositionFromDate(block.blockData.date) - this.negativeOffset;
        const span = getRowEndFromDatasetDuration(block.blockData.duration);
        block.htmlElement.style.gridRowStart = `${rowStart}`;
        block.htmlElement.style.gridRowEnd = `${rowStart + span}`;
    };

    addColCoordinates(block, index) {

        if (block.blockData.collisionList.length === 0) {
            block.htmlElement.style.gridColumn = '1 / -1';
            return;
        }
        block.htmlElement.style.gridColumn = `span ${this.numberOfCol / this.maxElemInRow}`;
    };

    buildGrid() {
        //generate Blocks from artist block list
        for (const [index, event] of this.artistBlockList.entries()) {
            const newBlock  = new GridBlock({blockData: event});

            this.addRowCoordinates(newBlock);
            this.addColCoordinates(newBlock, index);

            this.gridBlockArray.push(newBlock);
            this.planning.appendChild(newBlock.htmlElement);
        }
    };

    renderPlanning() {
        this.planning.innerHTML = '';
        this.buildGrid();
        return this.planning;
    };
}