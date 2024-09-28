import {appWorkspace} from "../../../script.js";
import {wsPopWindow_AddEvent} from "../wsCal_PopWindows/wsPopWindow_AddEventWindow.js";


export class EventDecorator_RecallFormOnClick {
    constructor(input) {
        this.eventsBlock = input.eventsBlock;
        this.addEventListener_onClick_formCallback(this.eventsBlock);
    };
    addEventListener_onClick_formCallback(eventsBlock) {
        // double click triggers the form callback to modify event block
        for (const block of eventsBlock) {
            const block_id = block.blockData._id;
            block.htmlElement.addEventListener('dblclick', () => appWorkspace.workSpaceStrategy.rightPanelContext.setRightPanel(wsPopWindow_AddEvent(block_id)))
        } //TODO: better access to setpopmenu
    };
}