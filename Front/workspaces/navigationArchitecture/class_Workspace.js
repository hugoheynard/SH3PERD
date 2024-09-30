import {HTMLelem} from "../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {PageContext} from "./class_pageContext.js";
import {RightPanelContext} from "./class_RightPanelContext.js";


export class Workspace {
    constructor(input) {
        this.appElements = new HTMLelem('div', 'appElements').render();
        this.appMenus = new HTMLelem('div', 'appMenus').render();

        this.wsMenu = input.wsMenu;
        this.defaultPage = input.defaultPage;
        this.defaultRightPanel = input.defaultRightPanel;

        this.pageContext = new PageContext({defaultPage: this.defaultPage});
        this.rightPanelContext = new RightPanelContext({defaultRightPanel: this.defaultRightPanel});
    };

    addWsMenu(menu) {
        this.appMenus.appendChild(menu.render());
    };

    async render() {
        try {
            this.app.appendChild(await this.pageContext.render());
            this.app.appendChild(this.rightPanelContext.rightPopPanel_html);
            this.app.appendChild(this.appMenus);

            if (this.wsMenu) {
                this.addWsMenu(this.wsMenu);
            }

            if (this.defaultRightPanel) {
                await this.rightPanelContext.setRightPanel(this.defaultRightPanel);
            }
        } catch (e) {
            console.error(e)
        }

    };
}