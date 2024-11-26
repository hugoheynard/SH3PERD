import { wrap_TryCatchNextErr } from "./utilities/wrap_tryCatchNextErr.js";
export const calendarController = (input) => {
    const { calendarService } = input;
    const controller = {
        async getCalendarData(req, res, next) {
            const calendarData = await calendarService.getCalendarData({
                date: req.body.date,
                staffMembers: req.body.staffMembers
            });
            res.status(200).json(calendarData);
        }
    };
    return wrap_TryCatchNextErr(controller);
};
//# sourceMappingURL=calendarController.js.map