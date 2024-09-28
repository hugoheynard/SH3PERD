import {HTMLelem} from "../frontElements/Classes/HTMLClasses/class_HTMLelem.js";

export class RightPanelContext {
    constructor(input) {
        this.defaultRightPanel = input.defaultRightPanel;
        this.currentRightPanel = this.defaultRightPanel;

        this.rightPopPanel_html = new HTMLelem('div', 'rightPopPanel').render();
        this.rightPopPanel_html.style.display = 'none';

    };

    undisplayPreviousPopMenu() {
        this.rightPopPanel_html.innerHTML = '';
    };

    async setRightPanel(newFunctionalityPage) {
        try {
            this.undisplayPreviousPopMenu();
            this.rightPopPanel_html.style.display = 'flex';

            if (!newFunctionalityPage) {
                throw new Error("Invalid page passed to setPopMenu");
            }

            this.currentRightPanel = await newFunctionalityPage;
            this.rightPopPanel_html.display = 'flex';
            this.rightPopPanel_html.appendChild(this.currentRightPanel)

        } catch(e) {
            console.error("Error in calAddEventWindow: ", e)
        }
    };

    render() {
        return this.currentRightPanel;
    };
}