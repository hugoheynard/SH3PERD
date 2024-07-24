import {HTMLelem} from "../../../Classes/HTMLClasses/class_HTMLelem.js";
import {Menu} from "../../../Classes/class_Menu.js";

class TrackCard {

    constructor(musicObject) {

        this.musicObject = musicObject;

        this.card = new HTMLelem('div', undefined, 'allCards trackCard_main').render();
        this.card.dataset.id = this.musicObject.id;

        this.addHeader();
        this.addBody();
        this.addFooter();

    };

    addHeader() {

        const header = new HTMLelem('div', undefined ,'trackCard_main_header').render();
        const trackName = new HTMLelem('span').render();
        trackName.textContent = this.musicObject.trackName;

        header.appendChild(trackName);



        this.card.appendChild(header);

    };

    addBody() {

        const body = new HTMLelem('div', undefined, 'trackCard_main_body').render();

        //const arrowVersions = new HTMLelem('button','button_hideVersions', "material-symbols-outlined").render()
        //arrowVersions.textContent = "arrow_circle_right";

        this.card.addEventListener('click', () => {



        });

        //body.appendChild(arrowVersions);

        this.card.appendChild(body)
    }

    addFooter() {

        const footer = new HTMLelem('div', undefined, 'trackCard_main_footer').render();


        const versionCount = document.createElement('span');
        versionCount.textContent = this.musicObject.vCountId + ' ' + 'versions';
        footer.appendChild(versionCount);

        this.card.appendChild(footer);
    };

    render() {

        return this.card;

    };
}



export {TrackCard};