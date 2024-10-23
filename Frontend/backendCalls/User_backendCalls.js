import {BackEndCall} from "./BackEndCalls.js";

export class User_backendCall extends BackEndCall {
    constructor(input) {
        super(input);
    };
    async getUserCompanies() {
        try {
            const response = await fetch(`${this.endpoint}/user/`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': 'application/json'
                },

            });

            if (response.ok) {
                return response
            }

            return response


        } catch(e) {

        }
    };
}