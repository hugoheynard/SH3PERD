import * as crypto from 'node:crypto';

interface JWTHeader {
    alg: string;
    typ: string;
}

interface JWTPayload {
    [key: string]: any;
}

export interface AuthTokenDecoded {
    isValid: boolean;
    header: JWTHeader;
    payload: JWTPayload
}

export class JWT_module {
    static readonly header: JWTHeader = {
        "alg": "HS256",
        "typ": "JWT"
    };

    static readonly secret: string = 'boiussfdfqldkfjqlkdfjqlkdjsgqlkj';

    static getToken(input: { payload: JWTPayload }): string {
        const unsignedToken = JWT_module.createUnsignedToken(input);
        const signature = JWT_module.signToken(unsignedToken);

        return [unsignedToken, signature].join('.');
    };

    static urlSafe(string: string): string {
        return string
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    };

    static urlSafe_decoder(string: string): string {
        let base64 = string
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        let padding = base64.length % 4;
        if (padding) {
            base64 += '='.repeat(4 - padding);
        }

        return base64;
    };

    static encode(element: object): string {
        const encoded = Buffer
            .from(JSON.stringify(element))
            .toString('base64');

        return this.urlSafe(encoded);
    };

    static createUnsignedToken(input: { payload: JWTPayload }): string {
        return `${JWT_module.encode(JWT_module.header)}.${JWT_module.encode(input.payload)}`;
    };

    static signToken(token: string): string {
        return crypto
            .createHmac('sha256', JWT_module.secret)
            .update(token)
            .digest('base64url');
    };

    static decode(jwt: string): AuthTokenDecoded {
        const [header64, payload64, signature64] = jwt.split('.');

        const header: JWTHeader = JSON.parse(Buffer.from(JWT_module.urlSafe_decoder(header64), 'base64').toString());
        const payload: JWTPayload = JSON.parse(Buffer.from(JWT_module.urlSafe_decoder(payload64), 'base64').toString());

        // Recreate the unsigned token to verify the signature
        const unsignedToken = `${header64}.${payload64}`;
        const expectedSignature = JWT_module.signToken(unsignedToken);

        // Verify the signature
        if (expectedSignature !== signature64) {
            throw new Error('Invalid signature');
        }

        return {isValid: true, header, payload};
    };
}