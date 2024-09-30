import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";

const wsPopMenu_CalendarHome = async () => {

    const calendarHome = new HTMLelem('div', 'calendarHome', '')
    calendarHome.setText('Hello World')

    return calendarHome.render();
}

export {wsPopMenu_CalendarHome}