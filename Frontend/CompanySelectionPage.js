import {HTMLelem} from "./frontElements/Classes/HTMLClasses/class_HTMLelem.js";

export class CompanySelectionPage{
    constructor(input) {
        this.backendCall = input.backendCall;

        this.html = new HTMLelem('div', 'companySelectionPage', '').render();
        this.selectCompany();
    };

    async selectCompany() {
        const data = await this.backendCall();

        if (!data) {
            console.log('error electCompany page')
            return;
        }

        console.log(data)
        //this.displayCompanies(data.userCompanies);


    };

    displayCompanies(userCompanies) {
        const companyDiv = new HTMLelem('div', '', '').render();


    };
}