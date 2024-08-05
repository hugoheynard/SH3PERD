import {IndividualPlanning} from "./class_IndividualPlanning.js";
import {sortBlockArrayPerTime} from "../../../../BackEnd/Utilities/sortBlockArray.js";
import {generateCssColors} from "../../../Utilities/DesignJS/ColorGenerator/createPlanningStylesheet.js";
import {getColorScheme} from "../../../../db/fakeDB-design.js";
import {findOccurrencesInArray} from "../../../Utilities/findOccurencesInArray.js";
import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";

class Calendar {
    constructor(timeTable, staffList, baseIndex = 0) {

        this.timeTable = timeTable;
        this.staffList = staffList;
        this.baseIndex = baseIndex;
        this.matrixList = this.listGranularity(this.staffList);
        this.planningList = [];
        this.currentArtist;

        this.colorScheme = generateCssColors(getColorScheme(), this.staffList);
        this.offset = this.getOffset();
        this.rowZoom = 18;
        this.fontZoom = 12;

        this.header = new HTMLelem('div', "calHeaderMatrix").render();
        this.parent = new HTMLelem('div', "calendars").render();

    };
    render(){

        this.resetInstanceAndContainer();
        this.getOffset();
        this.applyZoom();

        //Iteration
        for (const subList of this.matrixList) {

            if(this.matrixList.indexOf(subList) === this.baseIndex) {

                this.buildHeader(subList);

                //build planning for each artist
                for (const artist of subList) {

                    this.currentArtist = artist;

                    //Instance planning
                    const planning = new IndividualPlanning("planningIndiv", "calendars", this.timeTable, artist, this.offset).renderPlanning();
                    this.parent.appendChild(planning)
                    this.planningList.push(planning);

                }

            }

        }



        //this.generateFilters();
        return this.parent
    };

    listGranularity(staffList) {

    };

    buildHeader(subList) {

        const catArray = subList.map(element => element.category);
        const subcatArray = subList.map(element => element.subCategory);
        const nameArray = subList.map(element => element.firstName);

        //const header = document.getElementById('calHeaderMatrix');
        const header = this.header;
        header.innerHTML = '';
        header.style.gridTemplateColumns = `repeat(${subList.length}, 1fr)`;
        header.style.gridTemplateRows = `repeat(3, 22px)`;

        //POPULATE HEADER

        //Fill With Cats
        const catOccurObject = findOccurrencesInArray(catArray);

        for (const key in catOccurObject) {

            const catColor = this.colorScheme[key].colorCategory;

            const cat = document.createElement('span');
            cat.appendChild(document.createTextNode(key));
            cat.style.gridColumn = `span ${catOccurObject[key]}`;
            cat.style.gridRow = '1';
            cat.style.backgroundImage = catColor;

            header.appendChild(cat);
        }

        //fill with subCats
        const subCatOccurObject = findOccurrencesInArray(subcatArray);

        for (const cat in catOccurObject) {

            for (const key in subCatOccurObject) {

                const subCatColor = this.colorScheme[cat].colorSubCategories//Object.keys(subCatOccurObject).indexOf(key)

                const subCat = document.createElement('span');

                subCat.appendChild((()=> {

                    if(key === "null") {

                        return document.createTextNode('');

                    }

                    return document.createTextNode(key);

                })());

                subCat.style.gridColumn = `span ${subCatOccurObject[key]}`;
                subCat.style.gridRow = '2';
                subCat.style.backgroundColor = subCatColor;

                header.appendChild(subCat);

            }
        }


        //Fill with names
        for (const cat in catOccurObject) {

            for (const name of nameArray) {

                const nameContainerColor = this.colorScheme[cat].columnColor[`${cat}_${nameArray.indexOf(name) + 1}`];

                const artistName = document.createElement('span');
                artistName.appendChild(document.createTextNode(name));
                artistName.style.gridArea = `${3} / ${nameArray.indexOf(name) + 1} `;
                artistName.style.backgroundColor = nameContainerColor;

                header.appendChild(artistName);

            }
        }

    };

    getOffset() {

        const ONE_MIN_IN_MS = 60000;
        const STEP_DURATION = 5;
        const thisMatrixBlockArray = [];

        for (const artist of this.matrixList[this.baseIndex]) {

            thisMatrixBlockArray.push(...this.timeTable.filter(element => element.staff.includes(artist)));

        }

        const firstBlock = sortBlockArrayPerTime(thisMatrixBlockArray)[0];

        const dayStart = new Date(firstBlock.date);
        dayStart.setHours(0);
        dayStart.setMinutes(0);

        return (firstBlock.date - dayStart) / (ONE_MIN_IN_MS * STEP_DURATION) - 1;

    };

    applyZoom() {

        const sheet = document.styleSheets[0];
        const rules = sheet.cssRules;

        for (let rule of rules) {

            if (rule.selectorText === '.dpCalendar') {
                rule.style.gridTemplateRows = `repeat(600, ${this.rowZoom}px`;
                rule.style.fontSize = `${this.fontZoom}px`;
                break;
            }
        }

    };

    resetInstanceAndContainer() {
        this.header.innerHTML = '';
        this.parent.innerHTML = '';
    };

    generateFilters() {
        const parent = document.getElementById('filters');
        parent.innerHTML = "";
        //identify the needed filters
        const filterArray = [];

        for (const planning of this.planningList) {

            for (const type of planning.artistBlockList.map(block => block.type)) {

                if(!filterArray.includes(type)) {

                    filterArray.push(type);

                }

            }

        }

        //generates the filters

        for (const blockType of filterArray) {

            const filter = document.createElement('div');
            filter.setAttribute('class', 'filterDiv');

            const checkbox = document.createElement('input');
            checkbox.setAttribute('class', 'filterCheckbox');
            checkbox.type = 'checkbox';
            checkbox.id = blockType;
            checkbox.name = blockType;
            checkbox.checked = true;


            const label = document.createElement('label');
            label.setAttribute('class', 'filterLabel');
            label.appendChild(document.createTextNode(blockType));
            label.htmlFor = blockType;


            filter.appendChild(checkbox);
            filter.appendChild(label);

            //add Event listener

            checkbox.addEventListener('change', () => {

                const documentsBlock = document.querySelectorAll(`[data-type=${blockType}]`);

                if (checkbox.checked) {

                    for (const block of documentsBlock) {

                        block.style.display = "block";
                    }

                } else {

                    for (const block of documentsBlock) {

                        block.style.display = "none";
                    }

                }
            });

            parent.appendChild(filter);

        }

    };

    //EVENT LISTENERS METHODS
    zoomUp() {

        this.rowZoom += 10;
        this.fontZoom += 2;
        this.applyZoom();

    }

    zoomDown() {

        this.rowZoom -= 10;
        this.fontZoom -= 2;
        this.applyZoom();

    };

    navigateUpList(){

        if(this.baseIndex < this.matrixList.length) {

            this.baseIndex += 1;

        }

        this.render();

    };

    navigateDownList(){

        if(this.baseIndex > 0) {

            this.baseIndex -= 1;

        }

        this.render();

    };

}

export {Calendar}