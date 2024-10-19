import crypto from "node:crypto";


export class JWT_module {
    static #header = {
        "alg": "HS256",
        "typ": "JWT"
    };

    static #secret = 'boiussfdfqldkfjqlkdfjqlkdjsgqlkj';

    static getToken(input) {
        const unsignedToken = JWT_module.#createUnsignedToken(input);
        const signature = JWT_module.#signToken(unsignedToken);

        return [unsignedToken, signature].join('.');
    };

    static #urlSafe(string) {
        return string
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    };

    static #urlSafe_decoder(string) {
        let base64 = string
            .replace(/-/g, '+')
            .replace(/_/g, '/');

        let padding = base64.length % 4;
        if (padding) {
            base64 += '='.repeat(4 - padding);
        }

        return base64;
    };

    static #encode(element) {
        const encoded = Buffer
            .from(JSON.stringify(element))
            .toString('base64');

        return this.#urlSafe(encoded);
    };

    static #createUnsignedToken(input) {
        return `${JWT_module.#encode(JWT_module.#header)}.${JWT_module.#encode(input.payload)}`;
    };

    static #signToken(token) {
        return crypto
            .createHmac('sha256', JWT_module.#secret)
            .update(token)
            .digest('base64url');
    };

    static decode(jwt) {
        const [header64, payload64, signature64] = jwt.split('.');

        // Decode and parse the header
        const header = JSON.parse(Buffer.from(JWT_module.#urlSafe_decoder(header64), 'base64').toString());

        // Decode and parse the payload
        const payload = JSON.parse(Buffer.from(JWT_module.#urlSafe_decoder(payload64), 'base64').toString());

        // Recreate the unsigned token to verify the signature
        const unsignedToken = `${header64}.${payload64}`;
        const expectedSignature = JWT_module.#signToken(unsignedToken);

        // Verify the signature
        if (expectedSignature !== signature64) {
            throw new Error('Invalid signature');
        }

        return { header, payload };
    };
}