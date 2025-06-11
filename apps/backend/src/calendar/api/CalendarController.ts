import {autoBind} from "../../utils/classUtils/autoBind.js";
import {withErrorHandler} from "../../utils/errorManagement/tryCatch/withErrorHandler.js";

@autoBind
export class CalendarController {
    private readonly deps: any;

    constructor(deps: any) {
        this.deps = deps;
    }

    @withErrorHandler
    async getCalendar(input: any): Promise<void> {

    };
}