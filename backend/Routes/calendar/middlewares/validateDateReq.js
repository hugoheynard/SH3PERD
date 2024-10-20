export const validateDateReq = (req, res, next) => {
    const { date } = req.body;

    try {
        if (!date) {
            return res.status(400).json({ error: 'Date is required' });
        }

        const parsedDate = new Date(date);

        if (isNaN(parsedDate.getTime())) {
            return res.status(400).json({ error: 'Invalid date format' });
        }

        next(req);
    } catch (err) {
        next(err);
    }
};