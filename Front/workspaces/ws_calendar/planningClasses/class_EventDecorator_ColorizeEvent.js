import {EventSettings} from "../../../frontElements/init/init_appSettings.js";


export class EventDecorator_ColorizeEvent {
    constructor(input) {
        this.eventsBlock = input.eventsBlock || []; // Ensure it's an array
        this.colorize();
    };

    buildRGBA(colorObj, opacity) {
        return `rgba(${colorObj.r}, ${colorObj.g}, ${colorObj.b}, ${opacity})`;
    };

    async colorize() {
        try {
            for (const event of this.eventsBlock) {
                const elem = event.htmlElement;

                if (!elem) {
                    console.warn('Event html block is undefined for event:', event);
                    continue;
                }

                const baseColor = await EventSettings.getEventColor(event.blockData.type);

                if (baseColor && baseColor.length > 0) {
                    elem.style.backgroundColor = this.buildRGBA(baseColor[0], 0.2);
                    elem.style.borderLeftColor = this.buildRGBA(baseColor[0], 1);
                    elem.style.color = this.buildRGBA(baseColor[0], 0.8);
                } else {
                    console.warn(`No color found for event type: ${event.blockData.type}`);
                }
            }
        } catch (error) {
            console.error('Error fetching event color:', error);
        }
    };
}