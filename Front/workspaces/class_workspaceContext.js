class WorkSpaceContext{

    constructor(/*workSpaceStrategy*/) {

        //this.workSpaceStrategy = workSpaceStrategy;

    }

    eraseCurrentWorkspace() {

        const appPage = document.getElementById('appPage');

        appPage.innerHTML = "";

    };

    setWorkspace(newWorkSpace) {

        this.eraseCurrentWorkspace();
        this.workSpaceStrategy = newWorkSpace.render();

    };

}

export {WorkSpaceContext};