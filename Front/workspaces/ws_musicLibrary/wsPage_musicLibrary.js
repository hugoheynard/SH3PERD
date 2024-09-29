import {HTMLelem} from "../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {BackEndCall} from "../../backendCalls/class_BackEndCalls.js";
import {TrackCard} from "./musicLibrary/class_TrackCard.js";
import {TrackCardMenu} from "./musicLibrary/class_TrackCardMenu.js";
import {VersionCard} from "./musicLibrary/class_VersionCard.js";

const wsPage_musicLibrary = async () => {

    const musicGrid = new HTMLelem('div', 'musicGrid').render();


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

    return musicGrid

};

export {wsPage_musicLibrary};