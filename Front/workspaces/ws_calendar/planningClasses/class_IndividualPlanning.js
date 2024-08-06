import {GridBlock} from "./class_GridBlock/class_GridBlock.js";
import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";


class IndividualPlanning {
    constructor (id, parent_id, blockList, artist, negativeOffset) {
        this.planning = new HTMLelem('div', id, 'dpCalendar').render();

        this.blockList = blockList;
        this.artist = artist;
        this.negativeOffset = negativeOffset;

        this.artistBlockList = this.blockList.filter(blocks => blocks.staff.includes(this.artist));

        this.gridBlockArray = [];
    };

    buildGrid(blockList, negativeOffset = 0) {
        //generate Blocks
        for (const block of blockList) {

            const newBlock  = new GridBlock(block, this.negativeOffset);
            this.gridBlockArray.push(newBlock);

            this.planning.appendChild(newBlock.renderBlock());
        }
    };

    //TODO: Display as a line -> rowheight = 0?

    renderPlanning() {
        this.planning.innerHTML = '';

        this.buildGrid(this.artistBlockList);

        //adds Planning;
        return this.planning;
    };
}
export {IndividualPlanning};