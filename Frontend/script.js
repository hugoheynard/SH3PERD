import {AppContainer} from "./App.js";
import {LoginPage} from "./login/LoginPage.js";
import {CompanySelectionPage} from "./CompanySelectionPage.js";
import {ws_Calendar} from "./init/init_appWorkspaces.js";
import {menu_appGeneral} from "./menu_appGeneral.js";
import {WorkSpaceContext} from "./workspaces/navigationArchitecture/WorkspaceContext.js";
import {loginForm} from "./login/loginForm.js";
import {CookieManager} from "./login/postLoginProcess.js";
import {User_backendCall} from "./backendCalls/User_backendCalls.js";
import {startProcess_connection} from "./init/init_startProcess.js";
import {Calendar_BackendCall} from "./backendCalls/Calendar_BackendCall.js";


const appContainer = new AppContainer({ DOM: document });

/*
startProcess_connection({
    appContainer: appContainer,
    authManager: new CookieManager({ DOM: document }),
    loginPage: new LoginPage({ loginForm: loginForm }).html,
    selectCompanyPage: new CompanySelectionPage( { backendCall: new User_backendCall().getUserCompanies}).html,
});
*/


export const workspaceContext = new WorkSpaceContext({ /*defaultWorkspace: ws_Calendar*/ });

appContainer.buildCompanySpace({
    appMenu: menu_appGeneral.render(),
    workspaceContext: workspaceContext.render()
});

workspaceContext.setWorkspace(ws_Calendar)