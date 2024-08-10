import {GridBlock} from "./class_GridBlock/class_GridBlock.js";
import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {dragEnd, dragLeave, dragOver, dragStart, drop} from "../../../Utilities/DragNDropFunctions/dragAndDrop.js";
import {addMinutes} from "../../../../BackEnd/Utilities/Date_functions.js";
import {
    getPositionFromDataset_Date,
    getRowEndFromDatasetDuration
} from "../../../Utilities/dataset_functions/datasetFunctions.js";


class IndividualPlanning {
    constructor (input) {

        this.id = input.id;
        this.blockList = input.blockList;
        this.artist = input.artist;
        this.negativeOffset = input.negativeOffset;

        this.artistBlockList = this.blockList.filter(blocks => blocks.staff.includes(this.artist));
        this.collisionList = [];
        this.findCollisions();
        this.maxElemInRow = this.getMaxElemInRow() ?? 1;
        this.gridBlockArray = [];
        this.numberOfCol = this.defineColumnTemplate();

        this.planning = new HTMLelem('div', this.id, 'dailyPlanningCalendar').render();
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

            let step = addMinutes(block.date, -5);

            while (step < addMinutes(block.date, block.duration - 5)) {
                step = addMinutes(step, 5);
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
    addRowCoordinates(block) {
        const rowStart = getPositionFromDataset_Date(block.blockData.date) - this.negativeOffset;
        const span = getRowEndFromDatasetDuration(block.blockData.duration);
        block.block.style.gridRowStart = `${rowStart}`;
        block.block.style.gridRowEnd = `${rowStart + span}`;
    };
    addColCoordinates(block, index) {
        if (!this.collisionList[index].includes(block.blockData)) {
            block.block.style.gridColumn = '1 / -1';

        } else {
            const span = this.numberOfCol / this.collisionList[index].length;
            block.block.style.gridColumn = `span ${span}`;
        }
    };
    buildGrid(blockList, negativeOffset = 0) {
        //generate Blocks
        blockList.forEach((block, index) => {

            const newBlock  = new GridBlock({blockData: block});
            this.addRowCoordinates(newBlock);
            this.addColCoordinates(newBlock, index);

            this.gridBlockArray.push(newBlock);
            this.planning.appendChild(newBlock.renderBlock());
        })
    };
    //TODO: Display as a line -> rowheight = 0?
    buildDropDivOverlay() {

    };
    dragSystem() {

    }

    renderPlanning() {
        this.planning.innerHTML = '';

        this.buildGrid(this.artistBlockList);
        this.dragSystem();

        //adds Planning;
        return this.planning;
    };
}
export {IndividualPlanning};