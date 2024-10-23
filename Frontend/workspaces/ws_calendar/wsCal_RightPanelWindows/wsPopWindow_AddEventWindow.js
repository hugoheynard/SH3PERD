import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {FormRecall} from "../../../frontElements/Forms/FormBuilder/class_FormCallback.js";
import {form_addEvent} from "./form_addEvent.js";
import {Calendar_BackendCall} from "../../../backendCalls/Calendar_BackendCall.js";


export const wsPopWindow_AddEvent = async (input) => {
    /*If there is an input, it means we are trying to modify an event,
    so it triggers an alternate version of the original form
    with the data fetched from the db as default values*/

    const popWindow = new HTMLelem('div', 'addEvent', '').render();

    const form =  form_addEvent;
    try {
        if (!input) {
            popWindow.appendChild(form.render());
        }

        if (input) {
            const recalledForm = new FormRecall({
                callbackForm: form,
                //recalledValues: await recallEvent,
                updateAction: Calendar_BackendCall.PUT_event,
                deleteAction: Calendar_BackendCall.DELETE_event
            })
            popWindow.appendChild(recalledForm.render());
        }
        return popWindow;
    } catch(e) {

    }

};