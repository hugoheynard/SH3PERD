import {} from "express";
export const startServer = async (app) => {
    try {
        const PORT = parseInt(process.env.PORT, 10) || 3000;
        await app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (err) {
        console.error('Error starting the server:', err);
    }
};
//# sourceMappingURL=server.js.map