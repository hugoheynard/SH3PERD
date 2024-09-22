import {TechSetUp} from "../../../Classes/Activity_classes/class_TechSetUp.js";
import {art1} from "../../../../db/fakeDB.js";
import {DateMethod} from "../../../Utilities/class_DateMethods.js";
import {
    STANDARD_TECH_SETUP_DURATION,
    STANDARD_TECH_SETUP_HOUR,
    STANDARD_TECH_SETUP_MINUTES
} from "../../../../Front/Utilities/MAGIC NUMBERS.js";


class Auto_TechSetup{
    constructor(input) {
        this._timeTable = input.timeTable;
        this._date = input.date;
        this._generatedBlocks = [];
        this._rules = [];
    };
    get timeTable() {
        return this._timeTable;
    };
    get date() {
        return this._date;
    };
    get generatedBlocks() {
        return this._generatedBlocks;
    };
    get rules() {
        return this._rules;
    }; //TODO: check si on peut insérer des rules
    blockRequiringTechInstall = blockList => blockList.filter(block => block.needsTechInstall);
    noAdditionalSetup = () => this.blockRequiringTechInstall(this.timeTable).length === 0;
    addStandardSetUp(date) {
        /*standard setup is the base case in a daily operation scenario*/
        return new TechSetUp(
            {
                date: new Date(date.getFullYear(), date.getMonth(), date.getDate(), STANDARD_TECH_SETUP_HOUR, STANDARD_TECH_SETUP_MINUTES),
                duration: STANDARD_TECH_SETUP_DURATION,
                staff: [art1],
                content: {
                    title: "techSetUp",
                    description: ["PREP Standard setup"]
                },
                blockOrigin: "generatedBlock"
            });
    }
    buildTechBlocks() {
        this.generatedBlocks.push(this.addStandardSetUp(this.date));

        if (this.noAdditionalSetup) {
            return this.generatedBlocks;
        }

        /*If there is a need for another installation dependant of another activity earlier, we transfer the setup tasks to the earliest block */
        this.blockRequiringTechInstall(this.timeTable).forEach(block => {

            if (block.type === "rehearsal") {

                this.generatedBlocks.push(new TechSetUp(
                    {
                        date: DateMethod.substractMinutes(block.date, -15),
                        duration: 15,
                        staff: [art1],
                        content: {
                            title: "techSetUp",
                            description: [`Prep ${block.type} ${block.location} ${block.date.getHours()}'${block.date.getMinutes()}`]
                        },
                        blockOrigin: "generatedBlock"
                    })
                )
            }
        });
    };
}

export {Auto_TechSetup};