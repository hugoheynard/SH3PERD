import {IndividualPlanning} from "./class_IndividualPlanning.js";
import {sortBlockArrayPerTime} from "../../../../BackEnd/Utilities/sortBlockArray.js";
import {generateCssColors} from "../../../Utilities/DesignJS/ColorGenerator/createPlanningStylesheet.js";
import {getColorScheme} from "../../../../db/fakeDB-design.js";
import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {CalendarHeader} from "./class_CalendarHeader.js";

class Calendar {
    constructor(timeTable, staffList, baseIndex = 0) {

        this.timeTable = timeTable;
        this.staffList = staffList;
        this.baseIndex = baseIndex;
        this.matrixList = this.listGranularity(this.staffList);
        this.planningList = [];
        //this.currentArtist;

        this.colorScheme = generateCssColors(getColorScheme(), this.staffList);
        this.offset = this.getOffset();
        this.rowZoom = 18;
        this.fontZoom = 12;

        this.parent = new HTMLelem('div', "calendars").render();

    };

    listGranularity(staffList) {
    };
    buildCalendar(){
        this.resetInstanceAndContainer();
        this.getOffset();
        this.applyZoom();

        //Iteration
        for (const subList of this.matrixList) {

            if (this.matrixList.indexOf(subList) === this.baseIndex) {

                //this.buildHeader(subList);
                this.header = new CalendarHeader(
                    {
                        subList: subList,
                        colorScheme: this.colorScheme
                    }).render()

                //build planning for each artist
                for (const artist of subList) {

                    this.currentArtist = artist;

                    //Instance planning
                    const planning = new IndividualPlanning("planningIndiv", "calendars", this.timeTable, artist, this.offset);
                    this.planningList.push(planning);
                    this.parent.appendChild(planning.renderPlanning())
                }
            }
        }


    };

    render() {
        return this.parent
    };



    getOffset() {

        const ONE_MIN_IN_MS = 60000;
        const STEP_DURATION = 5;
        const thisMatrixBlockArray = [];

        for (const artist of this.matrixList[this.baseIndex]) {

            thisMatrixBlockArray.push(...this.timeTable.filter(element => element.staff.includes(artist)));

        }

        const firstBlock = sortBlockArrayPerTime(thisMatrixBlockArray)[0];

        const dayStart = new Date(firstBlock.date);
        dayStart.setHours(0);
        dayStart.setMinutes(0);

        return (firstBlock.date - dayStart) / (ONE_MIN_IN_MS * STEP_DURATION) - 1;

    };

    applyZoom() {

        const sheet = document.styleSheets[0];
        const rules = sheet.cssRules;

        for (let rule of rules) {

            if (rule.selectorText === '.dpCalendar') {
                rule.style.gridTemplateRows = `repeat(600, ${this.rowZoom}px`;
                rule.style.fontSize = `${this.fontZoom}px`;
                break;
            }
        }

    };

    resetInstanceAndContainer() {
        this.parent.innerHTML = '';
    };

    //EVENT LISTENERS METHODS
    zoomUp() {

        this.rowZoom += 10;
        this.fontZoom += 2;
        this.applyZoom();

    }

    zoomDown() {

        this.rowZoom -= 10;
        this.fontZoom -= 2;
        this.applyZoom();

    };

    navigateUpList(){

        if(this.baseIndex < this.matrixList.length) {

            this.baseIndex += 1;

        }

    };

    navigateDownList(){

        if(this.baseIndex > 0) {

            this.baseIndex -= 1;

        }

        this.render();

    };

}

export {Calendar}