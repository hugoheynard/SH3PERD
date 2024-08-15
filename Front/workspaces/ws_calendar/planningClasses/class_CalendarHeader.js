import {findOccurrencesInArray} from "../../../Utilities/findOccurencesInArray.js";
import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";


class CalendarHeader{
    constructor(input) {
        this.subList = input.subList;
        this.header = new HTMLelem('div', "calHeaderMatrix").render();
        this.matrixContainer = new HTMLelem('div', "matrixContainer").render();
        this.colorScheme = input.colorScheme;
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
    };
    manageCat() {
        for (const key in this.catOccurObject) {
            const cat = new HTMLelem('span');
            cat.setText(key);
            cat.render().style.gridColumn = `span ${this.catOccurObject[key]}`;
            cat.render().style.gridRow = '1';
            cat.render().style.backgroundColor = this.colorScheme.artistCategory({artistCategory: key});
            this.header.appendChild(cat.render());
        }
    };
    manageSubCat() {
        //TODO Gestion des nulls no subcat
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
            subCat.style.backgroundColor = this.colorScheme.artistSubCategory({artistSubCategory: subcat})

            this.header.appendChild(subCat);
        }
    };

    manageName() {
        for (const artist of this.subList) {
            const artistName = new HTMLelem('span', undefined, undefined);
            artistName.setText(artist.firstName);
            artistName.render().style.gridArea = `${3} / ${this.nameArray.indexOf(name) + 1} `;
            artistName.render().style.backgroundColor = this.colorScheme.artist({artistID: artist.staffMember_id}) ?? this.colorScheme.artistCategory({artistCategory: artist.category}) ;
            this.header.appendChild(artistName.render());
        }
    };

    buildHeader(subList) {
        this.initializeHeader();
        this.getSubListElements();
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