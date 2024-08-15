import {Rehearsal} from "../BackEnd/Classes/Activity_classes/class_Rehearsal.js";
import {Meeting} from "../BackEnd/Classes/Activity_classes/class_Meeting.js";
import {getActiveStaffPool} from "../BackEnd/Planning_Builder/Day_builder/DB_functions/getActiveStaffPool.js";
import {art1, art10, art11, art12, art13, art2, art3, art4, art5, art6, art7, art8, art9} from "./fakeDB.js";
import {Show} from "../BackEnd/Classes/Activity_classes/class_Show.js";


const table_meetings = [];

table_meetings.push(new Meeting(new Date(2024, 11, 19, 9, 30), 20, [art1]))
table_meetings.push(new Meeting(new Date(2024, 11, 19, 10, 0), 20, [art1]))
table_meetings.push(new Meeting(new Date(2024, 11, 19, 11, 0), 20, [art1]))
table_meetings.push(new Meeting(new Date(2024, 11, 19, 10, 0), 30, [art3]))
table_meetings.push(new Meeting(new Date(2024, 11, 19, 10, 0), 30, [art7]))



//REHEARSALS

const table_rehearsals = []

table_rehearsals.push(new Rehearsal(new Date(2024, 11, 19, 10, 0), 30, [art1, art2], "LPC", false, false))
table_rehearsals.push(new Rehearsal(new Date(2024, 11, 19, 10, 30), 30, [art7], "LPC", false, false))




const table_club = []
table_club.push(new Show(new Date(2024, 11, 19, 12, 0), 60, [art1, art2, art3], "clubRotation"))
table_club.push(new Show(new Date(2024, 11, 19, 12, 0), 60, [art11, art12, art13], "clubRotation"))
table_club.push(new Show(new Date(2024, 11, 19, 11, 30), 4, [art4, art5], "clubRotation"))
table_club.push(new Show(new Date(2024, 11, 19, 11, 30), 45, [art6, art7, art8, art9, art10], "clubRotation"))



export {table_meetings, table_rehearsals, table_club}