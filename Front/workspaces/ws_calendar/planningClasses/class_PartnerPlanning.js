import {GridBlock} from "./class_GridBlock/class_GridBlock.js";
//TODO : join planning -> ajoute une visualisation des gens avec qui je vais travailler sur le côté droit
//TODO : ajouter les gens qui sont avec moi sous forme de petit carré avec l'initiale et la couleur dans le block

class IndividualPlanning {
    constructor (id, parent_id, blockList, artist) {

        this.parent = document.getElementById(parent_id);

        this.planning = document.createElement('div');
        this.planning.setAttribute('class', 'dpCalendar');

        this.blockList = blockList;
        this.artist = artist;

        this.artistBlockList = this.blockList.filter(blocks => blocks.staff.includes(this.artist))

    }

    buildGrid(blockList, negativeOffset) {

        //generate Blocks
        for (const block of blockList) {

            this.planning.appendChild(new GridBlock(block, negativeOffset).renderBlock());

        }

        //repositions to remove top blank space

    }

    renderPlanning(classObj) {

        //auto execution first try, to subtract from every block
        const unusedPortionOfGrid = (() => {

            const ONE_MIN_IN_MS = 60000;
            const STEP_DURATION = 5;

            const firstBlock = this.blockList[0].date;
            const dayStart = new Date(this.blockList[0].date);
            dayStart.setHours(0);
            dayStart.setMinutes(0);

            return (firstBlock - dayStart) / (ONE_MIN_IN_MS * STEP_DURATION);
        })();

        //TODO : QUAND ON VA MODIF DES TRUCS MARCHERA POOOO
        //erases the potential grid
        //this.parent.innerHTML = "";

        this.buildGrid(this.artistBlockList, unusedPortionOfGrid);



        //adds Planning;
        this.parent.appendChild(this.planning);
    }
}

export {IndividualPlanning};