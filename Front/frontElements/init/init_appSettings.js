import {Settings_BackendCall} from "../../backendCalls/Settings_BackendCall.js";

class AppSettings{
    async getCompanySettings() {
        try {
            this.companySettings = await Settings_BackendCall.getCompanySettings('66f805b2e0137375bc1429fd');
        } catch (e) {
            console.error('Error while fetching company settings', e);
            throw e;
        }
    };

    async getUserSettings() {
        try {
            // Uncomment when available
            // this.userSettings = await Settings_BackendCall.getUserSettings();
        } catch (e) {
            console.error('Error while fetching user settings', e);
            throw e;
        }
    };

    async build() {
        try {
            await this.getCompanySettings();
            //await this.getUserSettings();
        } catch (e) {
            console.error('Error while initializing appSettings', e);
            throw e;
        }
    };
}

export const appSettings = new AppSettings();
await appSettings.build();

export class EventSettings {
    static async eventTypes() {
        const eventsData = await appSettings.companySettings.settings.events;
        return eventsData.map(event => event.type)
    };

    static async getEventColor(eventType) {
        const eventsData = await appSettings.companySettings.settings.events;
        return eventsData.filter(event => event.type === eventType)
            .map(event => event.color);
    };
}
