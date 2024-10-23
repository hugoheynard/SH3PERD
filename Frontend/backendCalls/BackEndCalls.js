import {CookieManager} from "../login/postLoginProcess.js";

export class BackEndCall {
    constructor() {
        this.endpoint = 'http://localhost:3000';
        this.authManager = new CookieManager({ DOM: document });
        this.token = this.authManager.getCookie('authToken');
    };
}