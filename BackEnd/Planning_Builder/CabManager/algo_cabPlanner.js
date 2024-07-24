/*

MANDATORY :

-> EACH CAB MUST END BY A MAX INTENSITY SHOW + HAVE ONE OF EACH INTENSITY
-> EACH CAB MUST BE DOABLE WITH ONE OF THE STAFF CONFIGURATION

RECOMMENDED :

-> THE SAME FINAL CAN'T BE PLAYED TWO DAYS IN A ROW


OPTIONAL :

-> must Match the weekly events theme

*/

import {Graph} from "../../Utilities/class_Graph.js";
import {staffConfigAllowsPerformance} from "./staffConfigAllowsPerformance.js";
import {cabList} from "../../../db/fakeDB_Cabaret.js";


const fullWeek = [
    {day: "sunday", intensity:[1, 2, 3], workingStaff : []},
    {day: "monday", intensity:[1, 2, 3]},
    {day: "tuesday", intensity:[1, 2, 3]},
    {day: "wednesday", intensity:[1, 2, 3]},
    {day: "thursday", intensity:[1, 2, 3]},
    {day: "friday", intensity:[1, 2, 3]},
]

const cabGraph = new Graph();

//populate graph
for (const day of fullWeek) {

    cabGraph.addNode(day.day);

    for (const show in cabList) {

        if (staffConfigAllowsPerformance(day, show)) {

        }

        cabGraph.addEdge(day.day, show)

    }
}



console.log(cabGraph)



