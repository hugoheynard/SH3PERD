import {GridBlock} from "./class_GridBlock/class_GridBlock.js";
import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {dragEnd, dragLeave, dragOver, dragStart, drop} from "../../../Utilities/DragNDropFunctions/dragAndDrop.js";
import {DateMethod} from "../../../../backend/Utilities/class_DateMethods.js";
import {
    getPositionFromDataset_Date,
    getRowEndFromDatasetDuration
} from "../../../Utilities/dataset_functions/datasetFunctions.js";
import {wsPopWindow_AddEvent} from "../wsCal_PopWindows/wsPopWindow_AddEventWindow.js";
import {wsPopWindow_AddTimeframe} from "../wsCal_PopWindows/wsPopWindow_AddTimeframeWindow.js";
import {appWorkspace} from "../../../script.js";


class IndividualPlanning {
    constructor (input) {
        this.id = input.id;
        this.artist = input.artist;
        this.negativeOffset = input.negativeOffset;

        this.artistBlockList = input.calendar_events;
        this.gridBlockArray = [];

        this.planning = new HTMLelem('div', this.id, 'dailyPlanningCalendar').render();
        //this.backgroundColor = input.backgroundOverlay;

        //sets the
        this.collisionList = [];
        this.findCollisions();
        this.maxElemInRow = this.getMaxElemInRow() ?? 1;
        this.numberOfCol = this.defineColumnTemplate();
        this.planning.style.gridTemplateColumns = `repeat(${this.numberOfCol}, 1fr)`;


        //TODO drop event listener
        /*
        this.planning.addEventListener('drop', (event) => {
            event.preventDefault();

            console.log(event.currentTarget.id)
            //const gridRow = window.getComputedStyle().gridRowStart;
           // console.log(`Dropped at grid-row: ${gridRow}`);
        });
        */
    };

    blockCollide(block1, block2){
        const getStepArray = block => {
            const stepArray = [];

            let step = DateMethod.substractMinutes(block.date, 5);

            while (step < DateMethod.addMinutes(block.date, block.duration - 5)) {
                step = DateMethod.addMinutes(step, 5);
                stepArray.push(JSON.stringify(step));
            }

            return stepArray;
        };
        return getStepArray(block1).some(elem => getStepArray(block2).includes(elem));
    };
    findCollisions() {
        for (const block of this.artistBlockList) {
            const collidingBlockList = [];

            const otherBlocks = this.artistBlockList.filter(elem => elem !== block);

            for (const otherBlock of otherBlocks) {

                if (this.blockCollide(block, otherBlock)) {

                    if (!collidingBlockList.includes(block)) {
                        collidingBlockList.push(block)
                    }

                    collidingBlockList.push(otherBlock);
                }
            }
            this.collisionList.push(collidingBlockList);
        }
    };
    getMaxElemInRow() {
        return Math.max(...this.collisionList.map(array => array.length));
    };
    defineColumnTemplate() {
        if (this.maxElemInRow % 2 !== 0) {
            return this.maxElemInRow * 2;
        }
        return this.maxElemInRow;
    };

    //GRID BLOCKS METHODS
    addRowCoordinates(block) {
        const rowStart = getPositionFromDataset_Date(block.blockData.date) - this.negativeOffset;
        const span = getRowEndFromDatasetDuration(block.blockData.duration);
        block.htmlElement.style.gridRowStart = `${rowStart}`;
        block.htmlElement.style.gridRowEnd = `${rowStart + span}`;
    };
    addColCoordinates(block, index) {
        if (!this.collisionList[index].includes(block.blockData)) {
            block.htmlElement.style.gridColumn = '1 / -1';

        } else {
            const span = this.numberOfCol / this.collisionList[index].length;
            block.htmlElement.style.gridColumn = `span ${span}`;
        }
    };
    addBackgroundOverlay(){
        const opacity = 0.025
        const currentColor = this.backgroundColor;
        const newColor = currentColor.replace(/rgba\((\d+),(\d+),(\d+),(\d+)\)/, `rgba($1,$2,$3,${opacity})`);
        this.planning.style.backgroundColor = newColor;
    }
    buildGrid() {
        //generate Blocks from artist block list
        for (const [index, event] of this.artistBlockList.entries()) {
            const newBlock  = new GridBlock({blockData: event});

            this.addRowCoordinates(newBlock);
            this.addColCoordinates(newBlock, index);
            //this.addBackgroundOverlay();

            this.gridBlockArray.push(newBlock);
            this.planning.appendChild(newBlock.htmlElement);
        }
    };

    //TODO: Display as a line -> rowheight = 0?
    buildDropDivOverlay() {

    };
    dragSystem() {

    }

    blockClickListener_formCallback() {
        // double click triggers the form callback to modify event block
        for (const block of this.gridBlockArray) {
            const block_id = block.blockData.id;
            block.htmlElement.addEventListener('dblclick', () => appWorkspace.workSpaceStrategy.popContext.setPopMenu(wsPopWindow_AddEvent(block_id)))
        } //TODO: better access to setpopmenu
    };

    renderPlanning() {
        this.planning.innerHTML = '';

        this.buildGrid();
        this.blockClickListener_formCallback();
        this.dragSystem();

        //adds Planning;
        return this.planning;
    };
}
export {IndividualPlanning};