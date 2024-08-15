import {IndividualPlanning} from "./class_IndividualPlanning.js";
import {sortBlockArrayPerTime} from "../../../../BackEnd/Utilities/sortBlockArray.js";

import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {CalendarHeader} from "./class_CalendarHeader.js";
import {CalHoursGrid} from "./class_calHoursGrid.js";
import {addMinutes} from "../../../../BackEnd/Utilities/Date_functions.js";
import {ONE_MINUTE_IN_MS, STEP_DURATION} from "../../../Utilities/MAGIC NUMBERS.js";
import {ColorScheme} from "../../../../db/fakeDB-design.js";

class Calendar {
    constructor(timeTable, staffList, baseIndex = 0) {
        this.timeTable = timeTable;
        this.staffList = staffList;
        this.baseIndex = baseIndex;
        this.matrixList = this.listGranularity(this.staffList);
        this.planningList = [];


        this.offset = this.getOffset();
        this.rowZoom = 18;
        this.fontZoom = 12;

        this.colorScheme = new ColorScheme().getColorData();

        this.htmlElement = new HTMLelem('div', "calendars").render();

        this.buildCalendar();
    };
    buildCalendar(){
        this.resetInstanceAndContainer();
        this.getOffset();
        this.applyZoom();
        this.addIndividualPlannings();
        this.buildGridOverlay();
        this.updateContainer();
    };
    listGranularity(staffList) {
    };
    defineGridRowsNumber(blockList) {
        /*Difference between the end of the last block and midnight */
        const firstWorkBlock = {...blockList[0]};
        const lastWorkBlock = {...blockList.at(-1)};
        const lastTime = addMinutes(lastWorkBlock.date, lastWorkBlock.duration).getTime();
        const firstTime = firstWorkBlock.date;

        this.gridRowsNumber = ((lastTime - firstTime) / ONE_MINUTE_IN_MS / STEP_DURATION)
    };
    resetInstanceAndContainer() {
        this.htmlElement.innerHTML = '';
    };
    buildGridOverlay() {
        //TODO Grid overlay - si on tombe sur une heure pleine, faire en sorte que la barre de l'overlay remplace et le chiffre se mettent en rouge et faire disparaitre l'overlay now
        const hourGrid = new CalHoursGrid(this.timeTable, this.offset);

        this.htmlElement.appendChild(hourGrid.calHoursLines);
        this.htmlElement.appendChild(hourGrid.calHoursText);

        hourGrid.calHoursLines.style.gridTemplateRows = `repeat(${this.gridRowsNumber}, 1rem)`;
        hourGrid.calHoursText.style.gridTemplateRows = `repeat(${this.gridRowsNumber}, 1rem)`;
    };
    addIndividualPlannings() {
        for (const subList of this.matrixList) {

            if (this.matrixList.indexOf(subList) === this.baseIndex) {
                this.defineGridRowsNumber(this.timeTable);

                //build planning for each artist
                for (const artist of subList) {

                    const planning = new IndividualPlanning(
                        {
                            id: `planning_${artist.staffMember_id}`,
                            blockList: this.timeTable,
                            artist: artist,
                            negativeOffset: this.offset,
                            numberOfRows: this.gridRowsNumber,
                            backgroundOverlay: this.colorScheme.artist({artistID: artist.staffMember_id})
                        });

                    this.planningList.push(planning);
                }

                this.header = new CalendarHeader(
                    {
                        subList: subList,
                        colorScheme: this.colorScheme
                    }).render()
            }


        }
    };

    updateContainer(){
        for (const planning of this.planningList) {
            planning.planning.style.gridTemplateRows = `repeat(${this.gridRowsNumber}, 1rem)`;
            this.htmlElement.appendChild(planning.renderPlanning())
        }
    };


    getOffset() {
        const thisMatrixBlockArray = [];

        for (const artist of this.matrixList[this.baseIndex]) {
            thisMatrixBlockArray.push(...this.timeTable.filter(element => element.staff.includes(artist)));
        }

        const firstBlock = sortBlockArrayPerTime(thisMatrixBlockArray)[0];
        const dayStart = new Date(firstBlock.date);

        dayStart.setHours(0);
        dayStart.setMinutes(0);

        return (firstBlock.date - dayStart) / (ONE_MINUTE_IN_MS * STEP_DURATION) - 1;
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



    //EVENT LISTENERS METHODS
    zoomUp() {

        this.rowZoom += 10;
        this.fontZoom += 2;
        this.applyZoom();

    };

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