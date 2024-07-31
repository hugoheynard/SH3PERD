import {HTMLelem} from "../../Classes/HTMLClasses/class_HTMLelem.js";
import {Menu} from "../../Classes/class_Menu.js";
import {MenuAction} from "../../Classes/menuClasses/class_MenuAction.js";
import {BackEndCall} from "../../Classes/class_BackEndCalls.js";
import {TrackCard} from "./musicLibrary/class_TrackCard.js";
import {VersionCard} from "./musicLibrary/class_VersionCard.js";
import {TrackCardMenu} from "./musicLibrary/class_TrackCardMenu.js";


class WS_MusicLibrary {

    constructor() {
        this.app = document.getElementById('appPage');
        this.appElements = new HTMLelem('div', 'appElements').render();
        this.appMenus = new HTMLelem('div', 'appMenus').render();
    }

    addWsMenu() {

        this.wsMenu = new Menu('workspaceMenu', undefined, 'button_lpm material-symbols-outlined');
        this.wsMenu.addButton(undefined, '+', () => MenuAction.addTrack());

        this.appMenus.appendChild(this.wsMenu.render());

    };

    addPopMenu() {
        this.popMenu = new HTMLelem('div', 'popMenu');
        this.appMenus.appendChild(this.popMenu.render());
    }

    async displayMusicLib () {

        const musicGrid = new HTMLelem('div', 'musicGrid').render();
        this.appElements.appendChild(musicGrid);

        const musicLibData = await BackEndCall.getMusicLib();

        for (const music of musicLibData) {

            const card = new TrackCard(music);

            HTMLelem.addClickAction(card, () => {

                const targets = Array.from(document.querySelectorAll(`[data-parent_id='${music.id}']`));

                for (const elem of targets) {

                    if(elem.style.display === "none") {

                        elem.style.display = "flex"

                    } else {

                        elem.style.display = "none";

                    }

                }

            });

            const cardMenu = new TrackCardMenu(music.id);

            musicGrid.appendChild(card.render());
            musicGrid.appendChild(cardMenu.render());

            //add version cards display none
            for (const version in music.versions) {

                musicGrid.appendChild(new VersionCard(music.versions[version]).render());

            }

        }

    }

    render() {

        this.addPopMenu();
        this.addWsMenu();
        this.app.appendChild(this.appElements);
        this.app.appendChild(this.appMenus);
        this.displayMusicLib();

        return this.app;

    }

}

//TODO WS-MusicLib Filter
/*

const musicLibHeader = new HTMLelem('div', 'musicLibHeader').render();
const musicLibFilter = new HTMLelem('div', 'musicLibFilter').render();

workspaceSection.appendChild(musicLibHeader);
workspaceSection.appendChild(musicLibFilter);

 */

export {WS_MusicLibrary};