import {BackEndCall} from "./BackEndCalls.js";

export class Login_BackendCall extends BackEndCall{
    static async login(formDataJSON) {
        try {
            const response = await fetch(
                `${this.endpoint}/auth/login`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formDataJSON)
                });

            if (!response.ok) {
                throw new Error('Network response was not ok - ' + response.status);
            }

            const data = await response.json();

            return {
                status: response.status,
                ok: response.ok,
                body: data.body
            };
        } catch (e) {
            throw e;
        }

    };
}