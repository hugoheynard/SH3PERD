import {} from "express";
export const verifyAuthToken = async (req, res, next) => {
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
        req.body.userToken = { ...fakeToken.payload };
        next();
    }
    catch (err) {
        next(err);
    }
};
//# sourceMappingURL=verifyAuthToken.js.map