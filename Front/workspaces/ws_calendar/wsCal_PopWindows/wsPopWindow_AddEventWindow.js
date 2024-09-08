import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {FormRecall} from "../../../frontElements/Forms/FormBuilder/class_FormCallback.js";
import {BackEndCall} from "../../../frontElements/Classes/class_BackEndCalls.js";
import {form_addEvent} from "./form_addEvent.js";
import {recallEvent} from "../../../../db/fakeDB_addEventForm.js";


const wsPopWindow_AddEvent = async (input) => {
    /*If there is an input, it means we are trying to modify an event,
    so it triggers an alternate version of the original form
    with the data fetched from the db as default values*/

    const popWindow = new HTMLelem('div', 'addEvent', '').render();

    const form =  form_addEvent;

    if (!input) {
        popWindow.appendChild(form.render());
    }

    if (input) {
        const recalledForm = new FormRecall({
            callbackForm: form,
            recalledValues: await recallEvent,
            updateAction: BackEndCall.PUT_event,
            deleteAction: BackEndCall.DELETE_event
        })
        popWindow.appendChild(recalledForm.render());
    }
    return popWindow;
};

export {wsPopWindow_AddEvent};