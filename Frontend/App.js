import {HTMLelem} from "./frontElements/Classes/HTMLClasses/class_HTMLelem.js";

export class AppContainer{
    constructor(input){
        this.DOM = input.DOM;
        this.cookieManager = input.cookieManager;
        this.initAppContainer();
    };

    initAppContainer() {
        this.body = this.DOM.body;
        this.appContainer = new HTMLelem('div', 'appContainer').elem;
        this.body.appendChild(this.appContainer);
    };

    setPage(newPage) {
        this.clearAppContainer();
        this.appContainer.appendChild(newPage);
    };

    clearAppContainer() {
        this.appContainer.innerHTML = '';
    };

    buildCompanySpace(input) {
        this.clearAppContainer();

        //insert the App left menu
        this.body.insertBefore(input.appMenu, this.appContainer);

        //TODO: topMenu plus clair
        const topMenu = new HTMLelem('div', 'topMenu').render();
        topMenu.appendChild(new HTMLelem('div').render());
        const meIcon = new HTMLelem('span', 'iconMe').render();
        meIcon.textContent = 'H';
        topMenu.appendChild(meIcon);
        this.appContainer.appendChild(topMenu);

        this.appContainer.appendChild(input.workspaceContext);
    };
}