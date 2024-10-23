import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";

class VersionCard {

    constructor(version) {

        this.version = version;

        this.versionCard = document.createElement('div');
        this.versionCard.style.display = "none";
        this.versionCard.dataset.version_id = version.id;
        this.versionCard.dataset.parent_id = version.id.split('v')[0];
        this.versionCard.setAttribute('class', 'allCards versionCard');

        this.addHeader();


    }

    addHeader() {
        const header = document.createElement('div');
        header.setAttribute('class', 'versionCard_header');

        const trackName = document.createElement('span');
        trackName.textContent = this.version.id;
        header.appendChild(trackName);

        const analyzeIcon = new HTMLelem('span', undefined, 'material-symbols-outlined');
        analyzeIcon.setText('equalizer');
        header.appendChild(analyzeIcon.render());


        return header
    }

    addBody() {
        //console.log(this.version)
        const body = document.createElement('div');
        body.setAttribute('class', 'versionCard_body');

        //filter the keys
        const specObj = Object.keys(this.version)
            .filter(key => key !== 'id' && key !== 'containerID')  // Remplacez la condition par celle qui vous intéresse
            .reduce((acc, key) => {
                acc[key] = this.version[key];
                return acc;
            }, {});

        for (const key in specObj) {

            const container = new HTMLelem('div', undefined, 'specContainer').render();

            const specTitle = new HTMLelem('span', undefined, 'specTitle');
            specTitle.setText(key);
            container.appendChild(specTitle.render());

            const specContent = new HTMLelem('span', undefined, 'specContent');
            specContent.setText(specObj[key]);
            container.appendChild(specContent.render());

            body.appendChild(container);

        }

        return body
    }

    addFooter() {

        const footer = new HTMLelem('div', undefined, 'versionCard_footer').render();

        const downloadIcon = new HTMLelem('span', undefined, 'material-symbols-outlined');

        downloadIcon.setText('download');

        footer.appendChild(downloadIcon.render());

        return footer

    };

    addDesignListeners() {

/*
        this.versionCard.addEventListener('mouseover', () => {
            this.versionCard.style.transform = 'scale(1.05)';
        });

        this.versionCard.addEventListener('mouseout', () => {
            this.versionCard.style.transform = 'scale(1)';
        });
*/
    }

    render() {

        this.versionCard.appendChild(this.addHeader());
        this.versionCard.appendChild(this.addBody());
        this.versionCard.appendChild(this.addFooter());

        this.addDesignListeners();


        return this.versionCard;

    };

}

export {VersionCard};