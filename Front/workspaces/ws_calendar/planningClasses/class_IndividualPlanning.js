import {GridBlock} from "./class_GridBlock/class_GridBlock.js";
import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {getPositionFromDate, getRowEndFromDatasetDuration} from "../../../Utilities/dataset_functions/datasetFunctions.js";


export class IndividualPlanning {
    constructor (input) {
        this.id = input.id;
        this.planning_events = input.calendar_events;
        this.collisionList = input.collisionList;
        this.negativeOffset = input.negativeOffset;
        this.numberOfRows = input.numberOfRows;
        this.rowSize = input.rowSize;

        this.html = new HTMLelem('div', this.id, 'dailyPlanningCalendar').render();
    };
    renderPlanning() {
        this.#resetPlanning();
        this.#setGridSpecs();
        this.#buildEventGridBlocks();
        this.#appendEventsToPlanning();

        return this.html;
    };

    //get grid specs
    #getMaxElemInRow() {
        const numberOfCollisionArray = Object.values(this.collisionList).map(array => array.length);
        return 1 + Math.max(...numberOfCollisionArray);
    };

    #defineColumnTemplate() {
        if (this.maxElemInRow % 2 !== 0) {
            return this.maxElemInRow * 2;
        }
        return this.maxElemInRow;
    };

    //GRID BLOCKS METHODS
    #addRowCoordinates(event) {
        const rowStart = getPositionFromDate(event.date) - this.negativeOffset;
        const span = getRowEndFromDatasetDuration(event.duration);
        return {
            rowStart: `${rowStart}`,
            rowEnd: `${rowStart + span}`
        }
    };

    #addColCoordinates(event_id) {

        if (this.collisionList[event_id].length === 0) {
            return '1 / -1';
        }
        return `span ${this.numberOfCol / this.maxElemInRow}`;
    };

    #buildEventGridBlocks() {
        for (const event of this.planning_events) {
            const newBlock  = new GridBlock({
                id: event._id,
                colCoordinates: this.#addColCoordinates(event._id),
                rowCoordinates: this.#addRowCoordinates(event),
                blockData: event
            });
            this.gridBlockArray.push(newBlock);
        }
    };

    #resetPlanning() {
        this.html.innerHTML = '';
        this.gridBlockArray = [];
    };

    #setGridSpecs() {
        this.maxElemInRow = this.#getMaxElemInRow() ?? 1;
        this.numberOfCol = this.#defineColumnTemplate() ?? 1;
        this.html.style.gridTemplateColumns = `repeat(${this.numberOfCol}, 1fr)`;
        this.html.style.gridTemplateRows = `repeat(${this.numberOfRows}, ${this.rowSize}px)`;
    };

    #appendEventsToPlanning() {
        for (const event of this.gridBlockArray) {
            this.html.appendChild(event.html)
        }
    };
}