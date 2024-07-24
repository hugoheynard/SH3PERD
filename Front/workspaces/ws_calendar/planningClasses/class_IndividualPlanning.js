import {GridBlock} from "./class_GridBlock/class_GridBlock.js";
import {HTMLelem} from "../../../Classes/HTMLClasses/class_HTMLelem.js";

class IndividualPlanning {
    constructor (id, parent_id, blockList, artist, negativeOffset) {

        this.parent = document.getElementById(parent_id);

        this.planning = document.createElement('div');
        this.planning.setAttribute('class', 'dpCalendar');
        this.planning.setAttribute('id', id);

        this.blockList = blockList;
        this.artist = artist;
        this.negativeOffset = negativeOffset;

        this.artistBlockList = this.blockList.filter(blocks => blocks.staff.includes(this.artist));

        this.gridBlockArray = [];

        this.renderPlanning();

    };

    buildGrid(blockList, negativeOffset = 0) {

        //generate Blocks
        for (const block of blockList) {

            const newBlock  = new GridBlock(block, this.negativeOffset);
            this.gridBlockArray.push(newBlock);

            this.planning.appendChild(newBlock.renderBlock());

        }

        //repositions to remove top blank space
    }

    //TODO: Display as a line -> rowheight = 0?

    renderPlanning() {

        this.planning.innerHTML = "";

        this.buildGrid(this.artistBlockList);

        //adds Planning;
        this.parent.appendChild(this.planning);
    };

}

export {IndividualPlanning};

