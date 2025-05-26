import {type Express} from "express";

export const startServer = async (input: { app: Express; port: string | undefined }): Promise<void> => {
    try {
        const { app, port } = input;
        const PORT: number = parseInt(port as string, 10) || 3000;

        await app.listen(PORT, (): void => {
            console.log(`✅ Server is running on port ${PORT}`);
        });
    } catch (err) {
        console.error('Error starting the server:', err)
    }
};