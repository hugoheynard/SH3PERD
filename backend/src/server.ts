import {Express} from "express";

export const startServer = async (app: Express): Promise<void> => {
    try {
        const PORT: number = parseInt(process.env.PORT as string, 10) || 3000;

        await app.listen(PORT, ():void => {
            console.log(`Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Error starting the server:', err);
    }
};