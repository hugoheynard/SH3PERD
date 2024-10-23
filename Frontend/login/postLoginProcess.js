export class CookieManager {
    constructor(input) {
        this.DOM = input.DOM
    }
    setCookie(name, value, days) {
        let expires = '';
        if (days) {
            const date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        this.DOM.cookie = name + "=" + (value || "") + expires + "; path=/";
    };

    getCookie(name) {
        const nameEQ = name + "=";
        const cookiesArray = this.DOM.cookie.split(';');
        for (let i = 0; i < cookiesArray.length; i++) {
            let cookie = cookiesArray[i];
            while (cookie.charAt(0) === ' ') cookie = cookie.substring(1, cookie.length);

            if (cookie.indexOf(nameEQ) === 0) {
                return cookie.substring(nameEQ.length, cookie.length);
            }
        }
        return null;
    };

    checkAuthCookies() {
        const authToken = this.getCookie('authToken');

        if (!authToken) { // or unvalidAuthToken check server
            return false;
        }

        return true
    };
}




export const postLoginProcess = logResponse => {

    //stores authCookie in document cookies
    const authToken = logResponse.body.authToken;
    setCookie('authToken', authToken, 7);


    console.log('getToken', getCookie('authToken'))

    //moveTo SelectCompany
};