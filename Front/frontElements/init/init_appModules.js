import {CalendarModule} from "../../workspaces/ws_calendar/class_CalendarModule.js";
import {Calendar_BackendCall} from "../../backendCalls/class_CalendarBackendCall.js";

export class AppModuleManager {
    constructor() {

    };
    addModule(input) {
        this[input.name] = input.module;
    };
}

export const appModuleManager = new AppModuleManager();
appModuleManager.addModule({name: 'calendar', module: new CalendarModule({data: await Calendar_BackendCall.getDay('2024-12-19')})})
