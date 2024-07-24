import {generateCssColors} from "../../../Utilities/DesignJS/ColorGenerator/createPlanningStylesheet.js";
import {getColorScheme} from "../../../../db/fakeDB-design.js";
import {IndividualPlanning} from "./class_IndividualPlanning.js";

class CalendarAll {

    constructor(timeTable, staffList, baseIndex = 0) {

        this.timeTable = timeTable;
        this.staffList = staffList
        this.matrixList = this.listGranularity(this.staffList);
        this.baseIndex = baseIndex;

        this.colorScheme = generateCssColors(getColorScheme(), this.staffList);

        this.renderMatrix();

        //document.getElementById("next").removeEventListener('click', () => this.navigateUpList())
        //document.getElementById("prev").removeEventListener('click', () => this.navigateDownList());
        //document.getElementById("next").addEventListener('click', () => this.navigateUpList());
        //document.getElementById("prev").addEventListener('click', () => this.navigateDownList());

    };

    listGranularity(staffList) {

        const matrixList = [];


        matrixList.push( [staffList] );



        return matrixList;
    };

    renderMatrix(){

        //define header container
        const header =  document.getElementById('calHeaderMatrix');

        //Erase all code
        header.innerHTML = "";
        document.getElementById("calendars").innerHTML = "";

        //Iteration
        for (const subList of this.matrixList) {
            console.log(subList)

            //build planning for each artist
            for (const artist of subList) {

                //Instance calendar
                new IndividualPlanning("matrixAll", "calendars", this.timeTable, artist).renderPlanning();

            }

        }


        //ajouter le grid partnerblock

    };
    /*
    buildHeader(subList) {

        const catArray = (() => {

            const catArray = [];

            for (const element of subList) {

                catArray.push(element.category);

            }

            return catArray;

        })();

        const subcatArray = (() => {

            const subcatArray = [];

            for (const element of subList) {

                subcatArray.push(element.subCategory);

            }

            return subcatArray;

        })();

        const nameArray = (() => {

            const nameArray = [];

            for (const element of subList) {

                nameArray.push(element.firstName);

            }

            return nameArray;

        })();

        //console.log(catArray);
        //console.log(subcatArray);
        //console.log(nameArray);


        const header = document.getElementById('calHeaderMatrix');
        header.inner = "";

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

                        return document.createTextNode("");

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

     */

    navigateUpList(){

        if(this.baseIndex < this.matrixList.length) {

            this.baseIndex += 1;

        }

        this.renderMatrix();

    };

    navigateDownList(){

        if(this.baseIndex > 0) {

            this.baseIndex -= 1;

        }

        this.renderMatrix();

    };


}

export {CalendarAll}