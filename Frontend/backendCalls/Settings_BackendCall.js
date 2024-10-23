import {BackEndCall} from "./BackEndCalls.js";

export class Settings_BackendCall extends BackEndCall{
    async getCompanySettings(company_id) {
        try {
            const response = await fetch(`${this.endpoint}/company/${company_id}/settings`);

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