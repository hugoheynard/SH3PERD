import {ws_Calendar} from "./frontElements/init/init_appWorkspaces.js";
import {HTMLelem} from "./frontElements/Classes/HTMLClasses/class_HTMLelem.js";
import {menu_appGeneral} from "./menu_appGeneral.js";
import {WorkSpaceContext} from "./workspaces/navigationArchitecture/class_WorkspaceContext.js";
import {loginForm} from "./frontElements/Forms/appForms/authentificationForms/loginForm.js";


export const appWorkspace = new WorkSpaceContext(
    {
        defaultWorkspace: ws_Calendar
    });

const body = document.querySelectorAll('body')[0];

//insert the App left menu
//body.appendChild(menu_appGeneral.render());

const mainContainer = new HTMLelem('div', 'mainContainer').render();
body.appendChild(mainContainer);

//topMenu
const topMenu = new HTMLelem('div', 'topMenu').render();
topMenu.appendChild(new HTMLelem('div').render());
const meIcon = new HTMLelem('span', 'iconMe').render();
meIcon.textContent = 'H';
topMenu.appendChild(meIcon);
//mainContainer.appendChild(topMenu);

//mainContainer.appendChild(appWorkspace.render());

export class loginPage {
    constructor(input) {
        this.loginForm = input.loginForm;

        this.html = new HTMLelem('div', 'loginPage', '').render();
        this.addLogo();
        this.addLoginForm({ form: this.loginForm.render() });
    };
    addLogo() {
        this.logoContainer = new HTMLelem('div', 'logoContainer').render();
        const logo = new HTMLelem('img')
        logo.setAttributes({src: '../Front/Public/logo/FullLogo_Transparent_NoBuffer.png'})
        this.logoContainer.appendChild(logo.render())
        this.html.appendChild(this.logoContainer);
    }

    addLoginForm(input) {
        this.login_formContainer = new HTMLelem('div', 'login_formContainer').render();
        this.login_formContainer.appendChild(input.form);
        this.html.appendChild(this.login_formContainer);
    };
}



mainContainer.appendChild(new loginPage({ loginForm: loginForm}).html);


