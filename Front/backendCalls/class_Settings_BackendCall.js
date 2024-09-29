import {BackEndCall} from "./class_BackEndCalls.js";

export class Settings_BackendCall {
    static async getCompanySettings() {
        try {
            const response = await fetch(`${BackEndCall.endpoint}/company/settings`);

            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }

            return await response.json();

        } catch(e) {
            console.error('There has been a problem with your fetch operation:', e);
            throw (e)
        }
    };
}