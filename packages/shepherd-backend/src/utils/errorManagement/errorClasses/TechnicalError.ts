export class TechnicalError extends Error {
    public readonly errorCode: string;
    public readonly statusCode: number;

    constructor(message: string, errorCode: string, statusCode = 500) {
        super(message);
        this.name = 'TechnicalError';
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}