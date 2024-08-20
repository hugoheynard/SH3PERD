import {Rehearsal} from "../BackEnd/Classes/Activity_classes/class_Rehearsal.js";
import {Meeting} from "../BackEnd/Classes/Activity_classes/class_Meeting.js";
import {art1, art10, art11, art12, art13, art2, art3, art4, art5, art6, art7, art8, art9} from "./fakeDB.js";
import {Show} from "../BackEnd/Classes/Activity_classes/class_Show.js";


const table_meetings = [];

table_meetings.push(
    new Meeting({
        date: new Date(2024, 11, 19, 9, 30),
        duration: 30,
        staff: [art1]
    })
)
table_meetings.push(
    new Meeting({
        date: new Date(2024, 11, 19, 10, 30),
        duration: 20,
        staff: [art1]
    })
)
table_meetings.push(
    new Meeting({
        date: new Date(2024, 11, 19, 11, 30),
        duration: 20,
        staff: [art1, art3, art7]
    })
)

//REHEARSALS

const table_rehearsals = []

table_rehearsals.push(
    new Rehearsal(
        {
            date: new Date(2024, 11, 19, 10, 0),
            duration: 45,
            staff: [ art6, art7, art8, art9,],
            location: "LPC",
            needsTechInstall: true,
            needsTechAssist: true
        })
)

table_rehearsals.push(
    new Rehearsal(
        {
            date: new Date(2024, 11, 19, 10, 30),
            duration: 30,
            staff: [art10],
            location: "LPC",
            needsTechInstall: false,
            needsTechAssist: false
        })
)





const table_club = []
//table_club.push(new Show(new Date(2024, 11, 19, 12, 0), 60, [art1, art2, art3], "clubRotation"))
//table_club.push(new Show(new Date(2024, 11, 19, 12, 0), 60, [art11, art12, art13], "clubRotation"))
//table_club.push(new Show(new Date(2024, 11, 19, 11, 30), 4, [art4, art5], "clubRotation"))
//table_club.push(new Show(new Date(2024, 11, 19, 11, 30), 45, [art6, art7, art8, art9, art10], "clubRotation"))



export {table_meetings, table_rehearsals, table_club}