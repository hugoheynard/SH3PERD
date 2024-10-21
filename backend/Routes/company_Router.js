import express from "express";


export const companyRouter = (companyController) => {
    const router = express.Router();

    router.get('/:id/settings', async (req, res)=> {
        const company_id = req.params.id;

        try {
            const result = await companyController.companyService.getCompanySettings(company_id)
            res.send(result)

        } catch (error) {
            console.error('Error retrieving day data:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    })
    return router;
}