import { STANDARD_TECH_SETUP_DURATION, STANDARD_TECH_SETUP_HOUR, STANDARD_TECH_SETUP_MINUTES } from "../../../utilities/MAGIC NUMBERS.js";
import { substractMinutes } from "../../../utilities/dateFunctions/date_functions.js";
export class Auto_TechSetup {
    _timeTable;
    _date;
    _generatedBlocks;
    _rules;
    constructor(input) {
        this._timeTable = input.timeTable;
        this._date = input.date;
        this._generatedBlocks = [];
        this._rules = [];
    }
    ;
    get timeTable() {
        return this._timeTable;
    }
    ;
    get date() {
        return this._date;
    }
    ;
    get generatedBlocks() {
        return this._generatedBlocks;
    }
    ;
    get rules() {
        return this._rules;
    }
    ; //TODO: check si on peut insérer des rules
    blockRequiringTechInstall = (blockList) => blockList.filter((block) => block.needsTechInstall);
    noAdditionalSetup = () => this.blockRequiringTechInstall(this.timeTable).length === 0;
    addStandardSetUp(date) {
        /*standard setup is the base case in a daily operation scenario*/
        return {
            date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), STANDARD_TECH_SETUP_HOUR, STANDARD_TECH_SETUP_MINUTES),
            duration: STANDARD_TECH_SETUP_DURATION,
            staff: [],
            content: {
                title: "techSetUp",
                description: ["PREP Standard setup"]
            },
            blockOrigin: "generatedBlock"
        };
    }
    ;
    buildTechBlocks() {
        this.generatedBlocks.push(this.addStandardSetUp(this.date));
        if (this.noAdditionalSetup) {
            return this.generatedBlocks;
        }
        /*If there is a need for another installation dependant of another activity earlier, we transfer the setup tasks to the earliest block */
        this.blockRequiringTechInstall(this.timeTable).forEach((block) => {
            if (block.type === "rehearsal") {
                this.generatedBlocks.push({
                    date: substractMinutes(block.date, -15),
                    duration: 15,
                    staff: [],
                    content: {
                        title: "techSetUp",
                        description: [`Prep ${block.type} ${block.location} ${block.date.getHours()}'${block.date.getMinutes()}`]
                    },
                    blockOrigin: "generatedBlock"
                });
            }
        });
    }
    ;
}
//# sourceMappingURL=blockGen_autoTechSetUp.js.map