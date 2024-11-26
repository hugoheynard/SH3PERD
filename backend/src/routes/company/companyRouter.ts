import express, {NextFunction, Request, Response, type Router} from "express";


export const companyRouter = (companyController: any): Router => {
    const router: Router = express.Router();

    router.get('/:id/settings', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const company_id = req.params.id;

        try {
            const result = await companyController.companyService.getCompanySettings(company_id)
            res.send(result)

        } catch (error) {
            console.error('Error retrieving day data:', error);
            res.status(500).json({error: 'Internal Server Error'});
        }
    })
    return router;
};