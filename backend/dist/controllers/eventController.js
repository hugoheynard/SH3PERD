import { wrap_TryCatchNextErr } from "./utilities/wrap_tryCatchNextErr.js";
export const eventsController = (input) => {
    const eventService = input.eventService;
    const controller = {
        async eventSearch(req, res) {
            res.status(200).json(await eventService.eventSearch(req.body.eventSearchParams));
        },
        async getEventById(req, res) {
            res.status(200).json(await eventService.getEventById({ id: req.query.id }));
        },
        async postEvent(req, res) {
            res.status(200).json(await eventService.postEvent());
        }
    };
    return wrap_TryCatchNextErr(controller);
};
//# sourceMappingURL=eventController.js.map