import {HTMLelem} from "../frontElements/Classes/HTMLClasses/class_HTMLelem.js";

export class LoginPage {
    constructor(input) {
        this.loginForm = input.loginForm;

        this.html = new HTMLelem('div', 'loginPage', '').render();
        this.addLogo();
        this.addLoginForm({ form: this.loginForm.render() });
    };
    addLogo() {
        this.logoContainer = new HTMLelem('div', 'logoContainer').render();
        const logo = new HTMLelem('img')
        logo.setAttributes({src: '../Frontend/Public/logo/FullLogo_Transparent_NoBuffer.png'})
        this.logoContainer.appendChild(logo.render())
        this.html.appendChild(this.logoContainer);
    }

    addLoginForm(input) {
        this.login_formContainer = new HTMLelem('div', 'login_formContainer').render();
        this.login_formContainer.appendChild(input.form);
        this.html.appendChild(this.login_formContainer);
    };
}