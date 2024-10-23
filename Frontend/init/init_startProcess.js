export const startProcess_connection = (input) => {
    const { appContainer, authManager, selectCompanyPage, loginPage } = input;

    appContainer.clearAppContainer();

    if (authManager.checkAuthCookies()) {
        appContainer.setPage(loginPage);
    }

    appContainer.setPage(selectCompanyPage)
};