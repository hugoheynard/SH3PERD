import {BackEndCall} from "./class_BackEndCalls.js";

export class Login_BackendCall{
    static async login(formDataJSON) {
        try {
            const response = await fetch(
                `${BackEndCall.endpoint}/auth/login`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formDataJSON)
                });

            if (!response.ok) {
                throw new Error('Network response was not ok - ' + response.status);
            }

            const data = await response.json();
            console.log('login response', data);

            return response.json();
        } catch (e) {
            throw e;
        }

    };
}