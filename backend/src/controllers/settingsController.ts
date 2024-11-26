import type {NextFunction, Request, Response} from "express";

export interface SettingsControllerInput {

}


export const settingsController = (input: any): any => {
    const { settingsService } = input;

    return {
        async getWeekTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                const result = await settingsService.getWeekTemplate({company_id: req.params.id});
                res.status(200).json(result);
                return;
            } catch (err: any) {
                next(err);
            }
        },

        async updateWeekTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
            try {
                const result = await settingsService.updateWeekTemplate({
                    settings_id: req.body.settings_id,
                    data: req.body.data
                })
                res.status(200).json(result);
                return;
            } catch (err: any) {
                next(err);
            }
        },

        async getOrganogram(req: Request, res: Response, next: NextFunction): Promise<void>{
            try {
                const organogram = await settingsService.getOrganogram({settings_id: req.params.id});
                res.status(200).json(organogram);
                return;
            } catch(err: any) {
                next(err);
            }
        },

        async updateOrganogram(req: Request, res: Response, next: NextFunction): Promise<void>{
            try {

            } catch(err: any) {
                next(err);
            }
        }
    };
};