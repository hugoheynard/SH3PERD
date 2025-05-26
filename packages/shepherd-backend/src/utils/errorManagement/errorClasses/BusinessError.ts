export class BusinessError extends Error {
    public readonly statusCode: number;
    public readonly errorCode: string;

    constructor(message: string, errorCode: string, statusCode = 400) {
        super(message);
        this.name = 'BusinessError';
        this.errorCode = errorCode;
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype);
    };
}