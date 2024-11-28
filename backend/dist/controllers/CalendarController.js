import { wrap_TryCatchNextErr } from "./utilities/wrap_tryCatchNextErr.js";
export const calendarController = (input) => {
    const { calendarService } = input;
    const controller = {
        async getCalendarData(req, res, next) {
            const calendarData = await calendarService.getCalendarData(req.body.calendarDataRequest);
            res.status(200).json({ calendarData: calendarData });
        }
    };
    return wrap_TryCatchNextErr(controller);
};
//# sourceMappingURL=calendarController.js.map