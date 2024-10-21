import express from "express";
import { validateDateReq } from "./middlewares/validateDateReq.js";

const verifyAuthToken = (req, res, next) => {
    //mockup Token
    const fakeToken = {
        payload: {
            user: {
                id: '66df0404c4d622c017701e3d',
                email: 'hheynard@gmail.com'
            },
            company: {
                id: '66f805b2e0137375bc1429fd',
            },
            contract: {
                id: '66e6ef0909eb46cb88b73957',
            }
        }
    };

    const authHeader = req.headers['authorization'];

    try {
        /*
        if(!authHeader) {
            return res.sendStatus(401);
        }
        */

        //const token = authHeader.split(' ')[1];
        //vérifier le token avec JWT verify logic

        req.userToken = { ...fakeToken.payload };

        next();
    } catch(err) {
        next(err);
    }
}

export const dateRouter = calendarController => {
    const router = express.Router();

    router.post('/',
        verifyAuthToken,
        //validateDateReq,
        //reqDateIsInContractDates,
        async (req, res) => {
            const { date } = req.body;

            try {
                const data = await calendarController.collectData(req);

                return res.status(200).json({
                    success: true,
                    receivedDate: date,
                    data: data
                });
            } catch (error) {
                console.error("Internal error while getting calendar day data:", error);

                return res.status(500).json({
                    success: false,
                    message: 'Internal error while getting calendar day data',
                    error: error.message,
                    stack: error.stack,
                    receivedDate: date,
                });
            }
        });
    return router;
};