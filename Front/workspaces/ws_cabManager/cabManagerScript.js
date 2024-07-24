import {CabTable} from "../../Classes/class_CabTable.js";
import {cabList, cabWeekOrder_userDefined} from "../../../db/fakeDB_Cabaret.js";
import {Grid} from "../../Classes/class_Grid.js";
import {dragEnd, dragStart} from "../../Utilities/DragNDropFunctions/dragAndDrop.js";
import {MiniCalendar} from "../../Classes/class_MiniCalendar.js";


const cabListContainer = document.getElementById('cabListContainer');

const weekDays = ["su", "mo", "tu", "we", "th", "fr", "sa"];
const showLeftContent = ["show-1", "show-2", "show-3"]

new Grid(1,1, 'blank', 'cabSplitView')
const weekDayGrid = new Grid(7, 1, 'weekDays', 'cabSplitView');
new Grid(1,1, 'blank', 'cabSplitView')
const showLeft = new Grid(1, 3, 'showLeft', 'cabSplitView');
const cabGrid = new Grid(7,3, 'cabGrid', 'cabSplitView')
const rightPanel = new Grid(1,1, 'rightPanel', 'cabSplitView')
cabGrid.addDragAndDropReceiverEvents() // je vais faire un decorator?
weekDayGrid.addContent(weekDays);
showLeft.addContent(showLeftContent);


for (const show of cabList) {

    const showElement = document.createElement('p');
    showElement.setAttribute('class', 'showElement')
    showElement.setAttribute('id', show.title)
    showElement.setAttribute('draggable', true)
    showElement.innerHTML += show.title;

    cabListContainer.appendChild(showElement)

    // add Event listeners :
    showElement.addEventListener('dragstart', dragStart);
    showElement.addEventListener('dragend', dragEnd);
}

//const cm_table = new CabTable("tableContainer", "2024-12-19", "cm_table pt_boxShadow");






