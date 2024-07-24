import {Activity} from "./Activity_classes/class_Activity.js";

class Guest extends Activity {

    constructor (date, duration = 5, [startTime_hours, startTime_minutes], membersArray) {

        super(date, duration, [startTime_hours, startTime_minutes], membersArray);
        this.type = "guest";
        this.id = this.idFromArray([this.date, ...this.startTime, this.type]);


    };

    defArtistName(artistName) {

        if (!artistName) {

            return "Guest_" + this.category;
        }

        return artistName.toString();

    };
}


/*
const guest = new Guest (

    "2024-12-19",
    60,
    [15,30],
    [],

    )


const table_guests = [guest];

export {table_guests}

 */