import express from "express";

export const weekTemplateRouter = settingsController => {
    const router = express.Router();

    router.get(
        '/id/:id',
        async (req, res, next) => {
            try {
                const result = await settingsController.getWeekTemplate(req.params.id);
                return res.status(200).json(result);
            }catch(e) {
                console.error('Error retrieving company settings - week template:', e);
                res.status(500).json({ error: 'Internal Server Error' });
            }
    });

    router.put(
        '/',
        async (req, res, next) => {
            try {
                const result = await settingsController.updateWeekTemplate(
                    {
                        id: req.body.settings_id,
                        data: req.body.data
                    });
                return res.status(200).json(result);
            }catch(e) {
                console.error('Error updating company settings - week template:', e);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        })

    return router;
};

export const companySettingsRouter = settingsController => {
    const router = express.Router();

    router.use('/weekTemplate', weekTemplateRouter(settingsController));

    return router;
};


export const settingsRouter = settingsController => {
    const router = express.Router();

    router.use('/company', companySettingsRouter(settingsController));

    return router;
};