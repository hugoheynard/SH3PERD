import {DateMethod} from "../../../backend/Utilities/class_DateMethods.js";

export const getPositionFromDate = data => {
    const date = new Date(data);
    const hours = date.getHours();
    const minutes = date.getMinutes();

    return (hours * 60 + minutes) / DateMethod.STEP_DURATION
};
