import {addMinutes, standardizeTime} from "../../../../BackEnd/Utilities/Date_functions.js";
import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {getPositionFromDataset_Date} from "../../../Utilities/dataset_functions/datasetFunctions.js";


class CalHoursGrid {
    constructor(timetable, offset) {
        this._timetable = timetable;
        this._offset = offset;
        this.hoursBlockList = this.getHoursBlockList();

        this.calHoursText = new HTMLelem('div', 'testHour').render();
        this.calHoursLines = new HTMLelem('div', 'calHoursLine').render();
        this.nowLine = new HTMLelem('div', 'nowLine').render();
        this.nowText = new HTMLelem('div', 'nowText').render();

        this.buildGrid();
        this.getNowLine();
    };

    get timetable() {
        return this._timetable;
    };

    get offset() {
      return this._offset;
    };

    getHoursBlockList() {
        const firstElem = this.timetable[0];
        const lastElem = this.timetable.at(-1);

        const stepArray = [];

        let step = addMinutes(firstElem.date, -5);

        while(step < addMinutes(lastElem.date, lastElem.duration)) {
            step = addMinutes(step, 5);

            if (step.getMinutes() === 0) {
                stepArray.push({date: step, duration: 60});
            }
        }

        return stepArray;
    };

    buildGrid() {

        for (const fullHour of this.hoursBlockList) {
            const rowStart = getPositionFromDataset_Date(fullHour.date) - this.offset - 1 //TODO WHY -1?

            const hourBlock  = new HTMLelem('div', undefined, 'hoursGridElement').render();
            hourBlock.style.gridRowStart = `${rowStart}`;
            //hourBlock.style.span = getRowEndFromDatasetDuration(fullHour.duration);

            const hourText = new HTMLelem('span', '', 'hourText');
            hourText.setText(`${fullHour.date.getHours()}:${standardizeTime(fullHour.date.getMinutes())}`);
            hourText.render().style.gridRowStart = `${rowStart}`;

            this.calHoursText.appendChild(hourText.render());
            this.calHoursLines.appendChild(hourBlock);
        }
    };

    getNowLine() {
        const rowStart = Math.floor(getPositionFromDataset_Date(Date.now()) - this.offset - 1);

        this.nowLine.style.gridRowStart = `${rowStart}`;
        this.calHoursLines.appendChild(this.nowLine);

        this.nowText.style.gridRowStart = `${rowStart}`;
        this.nowText.textContent = `${new Date(Date.now()).getHours()}:${new Date(Date.now()).getMinutes()}`;

        this.calHoursText.appendChild(this.nowText);
    };
}

export {CalHoursGrid};