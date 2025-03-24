import * as crypto from 'node:crypto';
import {JWT_module} from "../JWT_Module";

jest.mock('node:crypto');

describe('JWT_module', () => {

    // Mock the signature method to return a known value for predictable testing
    const mockSignature = 'mockSignature';

    // Create a mock implementation for createHmac
    const mockCreateHmac = jest.fn().mockReturnValue({
        update: jest.fn().mockReturnThis(),  // chainable `update` method
        digest: jest.fn().mockReturnValue(mockSignature)  // returns mock signature
    });

    beforeAll(() => {
        // Override the createHmac function to return our mock
        (crypto.createHmac as jest.Mock) = mockCreateHmac;
    });

    beforeEach(() => {
        // Clear all mocks before each test to ensure a clean slate
        mockCreateHmac.mockClear();
    });

    describe('getToken', () => {
        it('should generate a valid token', () => {
            const payload = { userId: 123, role: 'admin' };
            const token = JWT_module.getToken({ payload });

            // Check if the token has three parts (header, payload, and signature)
            const parts = token.split('.');
            expect(parts).toHaveLength(3);

            // Check if the signature part matches the mocked signature
            expect(parts[2]).toBe(mockSignature);
        });
    });

    describe('decode', () => {
        it('should decode and verify a valid token', () => {
            const payload = { userId: 123, role: 'admin' };
            const token = JWT_module.getToken({ payload });

            // Decode the token
            const decoded = JWT_module.decode(token);

            expect(decoded.isValid).toBe(true);
            expect(decoded.payload).toEqual(payload);
            expect(decoded.header.alg).toBe('HS256');
            expect(decoded.header.typ).toBe('JWT');
        });

        it('should throw an error for an invalid token signature', () => {
            const payload = { userId: 123, role: 'admin' };
            const token = JWT_module.getToken({ payload });

            // Modify the token to simulate an invalid signature
            const parts = token.split('.');
            const invalidToken = `${parts[0]}.${parts[1]}.invalidSignature`;

            expect(() => {
                JWT_module.decode(invalidToken);
            }).toThrowError('Invalid signature');
        });
    });

    describe('urlSafe and urlSafe_decoder', () => {
        it('should correctly encode and decode a string', () => {
            const originalString = 'Hello+World/==';

            const encoded = JWT_module.urlSafe(originalString);
            expect(encoded).toBe('Hello-World_');

            const decoded = JWT_module.urlSafe_decoder(encoded);

            // Decode both and compare the decoded content
            const originalDecoded = Buffer.from(originalString, 'base64').toString();
            const decodedContent = Buffer.from(decoded, 'base64').toString();
            expect(decodedContent).toBe(originalDecoded);
        });
    });

    describe('encode', () => {
        it('should base64 URL-safe encode an object', () => {
            const obj = { key: 'value' };
            const encoded = JWT_module.encode(obj);
            const expected = 'eyJrZXkiOiJ2YWx1ZSJ9';  // base64 encoded string of '{"key":"value"}'

            expect(encoded).toBe(expected);
        });
    });

    describe('signToken', () => {
        it('should generate a signature for the token', () => {
            const unsignedToken = 'header.payload';

            const signature = JWT_module.signToken(unsignedToken);
            expect(signature).toBe(mockSignature);

            // Check if `createHmac` was called correctly
            expect(crypto.createHmac).toHaveBeenCalledWith('sha256', JWT_module.secret);
            expect(mockCreateHmac().update).toHaveBeenCalledWith(unsignedToken);
            expect(mockCreateHmac().digest).toHaveBeenCalledWith('base64url');
        });
    });
});