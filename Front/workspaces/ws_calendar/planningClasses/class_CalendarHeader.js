import {findOccurrencesInArray} from "../../../Utilities/findOccurencesInArray.js";
import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";


class CalendarHeader{
    //TODO : replace color attribution by adding dataset category/subcat/name
    constructor(input) {

        //this.colorScheme = input.colorScheme;
        this.subList = input.subList;
        this.header = new HTMLelem('div', "calHeaderMatrix").render();
        this.matrixContainer = new HTMLelem('div', "matrixContainer").render();

        this.buildHeader(this.subList)
    };

    getSubListElements(){
        this.catArray = this.subList.map(element => element.category);
        this.subcatArray = this.subList.map(element => element.subCategory);
        this.nameArray = this.subList.map(element => element.firstName);
    };

    initializeHeader() {
        this.header.innerHTML = '';
        this.header.style.gridTemplateColumns = `repeat(${this.subList.length}, 1fr)`;
    };

    getOccurencesObjects() {
        this.catOccurObject = findOccurrencesInArray(this.catArray);
        this.subCatOccurObject = findOccurrencesInArray(this.subcatArray);
    }

    manageCat() {
        for (const key in this.catOccurObject) {

            //const catColor = this.colorScheme[key].colorCategory;
            const cat = document.createElement('span');
            cat.appendChild(document.createTextNode(key));
            cat.style.gridColumn = `span ${this.catOccurObject[key]}`;
            cat.style.gridRow = '1';
            //cat.style.backgroundImage = catColor;

            this.header.appendChild(cat);
        }
    };

    manageSubCat() {
        for (const subcat in this.subCatOccurObject) {

            const subCat = document.createElement('span');

            subCat.appendChild((()=> {

                if(subcat === "null") {

                    return document.createTextNode('');

                }

                return document.createTextNode(subcat);

            })());

            subCat.style.gridColumn = `span ${this.subCatOccurObject[subcat]}`;
            subCat.style.gridRow = '2';

            this.header.appendChild(subCat);
        }

    };

    manageName() {
        for (const cat in this.catOccurObject) {

            for (const name of this.nameArray) {

                //const nameContainerColor = this.colorScheme[cat].columnColor[`${cat}_${this.nameArray.indexOf(name) + 1}`];

                const artistName = document.createElement('span');
                artistName.appendChild(document.createTextNode(name));
                artistName.style.gridArea = `${3} / ${this.nameArray.indexOf(name) + 1} `;
                //artistName.style.backgroundImage = nameContainerColor;

                this.header.appendChild(artistName);

            }
        }
    }

    buildHeader(subList) {
        this.getSubListElements();
        this.initializeHeader();
        this.getOccurencesObjects();
        this.manageCat();
        this.manageSubCat();
        this.manageName();
    };
    render() {
        return this.header;
    };
}

export {CalendarHeader};