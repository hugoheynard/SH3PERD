export const settingsController = (input) => {
    const { settingsService } = input;
    return {
        async getWeekTemplate(req, res, next) {
            try {
                const result = await settingsService.getWeekTemplate({ company_id: req.params.id });
                res.status(200).json(result);
                return;
            }
            catch (err) {
                next(err);
            }
        },
        async updateWeekTemplate(req, res, next) {
            try {
                const result = await settingsService.updateWeekTemplate({
                    settings_id: req.body.settings_id,
                    data: req.body.data
                });
                res.status(200).json(result);
                return;
            }
            catch (err) {
                next(err);
            }
        },
        async getOrganogram(req, res, next) {
            try {
                const organogram = await settingsService.getOrganogram({ settings_id: req.params.id });
                res.status(200).json(organogram);
                return;
            }
            catch (err) {
                next(err);
            }
        },
        async updateOrganogram(req, res, next) {
            try {
            }
            catch (err) {
                next(err);
            }
        }
    };
};
//# sourceMappingURL=settingsController.js.map