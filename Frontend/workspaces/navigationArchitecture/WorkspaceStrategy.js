import {HTMLelem} from "../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {PageContext} from "./PageContext.js";
import {RightPanelContext} from "./RightPanelContext.js";


export class WorkspaceStrategy {
    constructor(input) {
        this.appElements = new HTMLelem('div', 'appElements').render();
        this.appMenus = new HTMLelem('div', 'appMenus').render();

        this.wsMenu = input.wsMenu;
        this.defaultPage = input.defaultPage;
        //this.defaultRightPanel = input.defaultRightPanel;

        this.pageContext = new PageContext();
        this.rightPanelContext = new RightPanelContext({defaultRightPanel: this.defaultRightPanel});
    };

    addWsMenu(menu) {
        this.appMenus.appendChild(menu.render());
    };

    async render() {
        try {
            this.workspaceContainer.appendChild(this.pageContext.html);
            this.workspaceContainer.appendChild(this.rightPanelContext.rightPopPanel_html);
            this.workspaceContainer.appendChild(this.appMenus);

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