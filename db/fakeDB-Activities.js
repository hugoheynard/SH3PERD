import {Rehearsal} from "../backend/Classes/Activity_classes/class_Rehearsal.js";
import {art1, art10, art11, art12, art13, art2, art3, art4, art5, art6, art7, art8, art9} from "./fakeDB.js";
import {Show} from "../backend/Classes/Activity_classes/class_Show.js";

import {ObjectId} from "mongodb";


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




export {table_rehearsals, table_club}