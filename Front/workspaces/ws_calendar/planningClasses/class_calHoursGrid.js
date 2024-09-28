import {DateMethod} from "../../../../backend/Utilities/class_DateMethods.js";
import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {getPositionFromDate} from "../../../Utilities/dataset_functions/datasetFunctions.js";


class CalHoursGrid {
    constructor(input) {
        this._calendar_events = input.calendar_events;
        this._offset = input.offset;
        this.earliestTimeStep = input.earliestTimeStep;
        this.latestTimeStep = input.latestTimeStep;

        this.buildGrid();
        this.displayNowElements();
    };

    get calendar_events() {
        return this._calendar_events;
    };

    get offset() {
      return this._offset;
    };

    getHoursBlockList() {
        const stepArray = [];

        let step = this.earliestTimeStep;
        while(step <= this.latestTimeStep) {

            if (step.getMinutes() === 0) {
                stepArray.push({date: step, duration: 60});
            }

            step = DateMethod.addMinutes(step, 5);
        }
        return stepArray;
    };

    buildGrid() {
        this.calHoursText = new HTMLelem('div', 'testHour').render();
        this.calHoursLines = new HTMLelem('div', 'calHoursLine').render();

        for (const fullHour of this.getHoursBlockList()) {
            let rowStart = getPositionFromDate(fullHour.date) - this.offset - 1;

            if (rowStart < 0) {
                /*To manage the exception to an event going after midnight, we add a full day as a positive offset*/
                rowStart += DateMethod.ONE_DAY_IN_STEPS;
            }

            //each block is a grey line
            //TODO Grid overlay - si on tombe sur une heure pleine, faire en sorte que la barre de l'overlay remplace et le chiffre se mettent en rouge et faire disparaitre l'overlay now
            const hourBlock  = new HTMLelem('div', undefined, 'hoursGridElement').render();
            hourBlock.style.gridRowStart = `${rowStart}`;

            const hourText = new HTMLelem('span', '', 'hourText');
            hourText.setText(`${DateMethod.standardizeTime(fullHour.date.getHours())}:${DateMethod.standardizeTime(fullHour.date.getMinutes())}`);
            hourText.render().style.gridRowStart = `${rowStart}`;

            this.calHoursText.appendChild(hourText.render());
            this.calHoursLines.appendChild(hourBlock);
        }
    };

    displayNowElements() {
        if (DateMethod.inBetweenDates(new Date(Date.now()), this.earliestTimeStep, this.latestTimeStep)) {

            this.nowLine = new HTMLelem('div', 'nowLine').render();
            this.nowText = new HTMLelem('div', 'nowText').render();

            const rowStart = Math.floor(getPositionFromDate(Date.now()) - this.offset - 1);

            this.nowLine.style.gridRowStart = `${rowStart}`;
            this.calHoursLines.appendChild(this.nowLine);

            this.nowText.style.gridRowStart = `${rowStart}`;
            this.nowText.textContent = `${DateMethod.standardizeTime(new Date(Date.now()).getHours())}:${DateMethod.standardizeTime(new Date(Date.now()).getMinutes())}`;

            this.calHoursText.appendChild(this.nowText);
        }
    };
}

export {CalHoursGrid};