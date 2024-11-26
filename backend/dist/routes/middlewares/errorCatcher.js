export const errorCatcher = (err, req, res, next) => {
    const message = err.message && err.message.trim() ? err.message : 'Internal Server Error';
    console.error('Error:', err.message);
    res.status(500).json({
        error: true,
        message: message || 'Internal Server Error',
    });
};
//# sourceMappingURL=errorCatcher.js.map