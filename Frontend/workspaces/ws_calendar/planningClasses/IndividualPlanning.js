import {GridBlock} from "./GridBlock.js";
import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {getPositionFromDate, getRowEndFromDatasetDuration} from "../../../Utilities/dataset_functions/datasetFunctions.js";

export class IndividualPlanning {
    constructor (input) {
        this.id = input.id;
        this.color = ' #142b3f';
        this.planning_events = input.calendar_events;
        this.collisionList = input.collisionList;
        this.negativeOffset = input.negativeOffset;
        this.numberOfRows = input.numberOfRows;
        this.maxElemInRow = input.maxInternalCollisions + 1 //offset if no collisions;
        this.rowSize = input.rowSize;

        this.html = new HTMLelem('div', this.id, 'dailyPlanningCalendar').render();
        this.html.style.backgroundColor = ' #142b3f15';
        this.createCollisionIdSet();
        this.renderPlanning();
    };

    renderPlanning() {
        this.resetPlanning();
        this.setGridSpecs();
        this.buildEventGridBlocks({ eventSource: this.planning_events});
        this.appendAllEventsToPlanning(this.gridBlockArray);
    };


    createCollisionIdSet() {
        this.collisionIdSet = new Set([
            ...new Set(this.collisionList.map(ev => ev.referenceEvent)),
            ...new Set(this.collisionList.map(ev => ev.comparedToEvent))
        ]);
    };

    defineColumnTemplate() {
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
        if (!this.collisionIdSet.has(event_id)) {
            return '1 / -1';
        }
        return `span ${this.numberOfCol / this.maxElemInRow}`;
    };

    buildEventGridBlocks(input) {
        this.gridBlockArray = [];
        for (const event of input.eventSource) {
            this.gridBlockArray.push(
                new GridBlock({
                    id: event._id,
                    colCoordinates: this.#addColCoordinates(event._id),
                    rowCoordinates: this.#addRowCoordinates(event),
                    blockData: event
                })
            );
        }
    };

    resetPlanning() {
        this.html.innerHTML = '';
        this.gridBlockArray = [];
    };

    setGridSpecs() {
        this.numberOfCol = this.defineColumnTemplate() ?? 1;
        this.html.style.gridTemplateColumns = `repeat(${this.numberOfCol}, 1fr)`;
        this.html.style.gridTemplateRows = `repeat(${this.numberOfRows}, ${this.rowSize}px)`;
    };

    appendAllEventsToPlanning(eventListToDisplay) {
        this.html.innerHTML = '';
        for (const event of eventListToDisplay) {
            this.html.appendChild(event.html);
        }
    };
    showPlanning() {
        this.html.style.display = 'grid';
    };

    hidePlanning() {
        this.html.style.display = 'none';
    };
}