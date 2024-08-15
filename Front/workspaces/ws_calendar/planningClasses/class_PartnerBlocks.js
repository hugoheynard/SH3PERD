import {HTMLelem} from "../../../frontElements/Classes/HTMLClasses/class_HTMLelem.js";

class PartnerBlock {
    constructor() {
        this.elem = new HTMLelem('div', undefined, 'partnerBlock').render();
    };
}

export {PartnerBlock};