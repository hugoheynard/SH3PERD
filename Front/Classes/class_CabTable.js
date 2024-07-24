import {dragLeave, dragOver, drop} from "../Utilities/DragNDropFunctions/dragAndDrop.js";
import {Grid} from "./class_Grid.js";

class CabTable {
    constructor() {
    }

    addElement(element) {

        return document.createElement(element);

    };

    setID(elem, id) {
        elem.setAttribute('id', id);
    }

    setClass(elem, css) {
        elem.setAttribute('class', css);
    }

    addWeekDays(id, css, parent = document.querySelector('body')) {

        const weekDays = ["su", "mo", "tu", "we", "th", "sa"];
        const weekDayGrid = new Grid(7, 1, 'weekDays', 'cabSplitView')

        //const weekDaysContainer = this.addElement('div');
        //this.setID(weekDaysContainer, id);
        //this.setClass(weekDaysContainer, css);

        /**/
        for (const day of weekDays) {

            const elem = this.addElement('div');

            elem.append(document.createTextNode(day));

            weekDaysContainer.appendChild(elem);
        }

        parent.appendChild(weekDaysContainer);
    }
}


export {CabTable};

