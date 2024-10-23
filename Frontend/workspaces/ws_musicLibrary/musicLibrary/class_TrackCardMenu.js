import {Menu} from "../../../frontElements/Classes/class_Menu.js";
import {MenuAction} from "../../../frontElements/Classes/menuClasses/class_MenuAction.js";
import {BackEndCall} from "../../../backendCalls/BackEndCalls.js";

class TrackCardMenu {

    constructor(musicID) {

        this.trackCardMenu = new Menu(undefined, 'allCards trackCardMenu', 'button_lpm material-symbols-outlined');
        this.trackCardMenu.addButton(undefined, 'edit_note', () => MenuAction.trackCardMenu_EditTrackName(musicID));
        this.trackCardMenu.addButton(undefined, 'post_add', undefined);
        this.trackCardMenu.addButton(undefined, 'delete_forever', () => BackEndCall.DELETE_track(musicID));

        this.trackCardMenu.render().dataset.parent_id = musicID;
        this.trackCardMenu.render().style.display = "none";
    }

    render() {

        return this.trackCardMenu.render();
    };
}

export {TrackCardMenu};