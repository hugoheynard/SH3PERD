import {PasswordHasher} from "./PasswordHasher.js";
import {jest} from '@jest/globals';

describe('class PasswordHasher', () => {

    const instance = new PasswordHasher();
    const passwordToHash = 'my2024Pass!';
    const mockSalt = '7f209f8866f5a55fe4b7e4cd82ded8f6';
    const expectedDerivedKey = 'eef28ccfbbd21fdc6d012086bab478bf03e1b4ca573232a87a3249ca43d02c9daf6a305b2affb0c61d62016c7d18e8c3c3d65f38031796324701ce59cb181a57';

    describe('method generate salt', () => {
        test('should generate different salts each time', () => {
            const salt1 = instance.generateSalt();
            const salt2 = instance.generateSalt();
            expect(salt1).not.toBe(salt2);
        });
    });

    describe('method generateKey', () => {
        test('should generate the correct derived key from password and salt', async () => {
            const result = await PasswordHasher.generateKey(passwordToHash, mockSalt);

            expect(result).toBe(expectedDerivedKey);
        });
    });

    describe('method hashPass', () => {
        test('should hash its input according to #hashParams specs and return a string "salt:hashedPass"', async () => {

            jest.spyOn(instance, 'generateSalt').mockReturnValue(mockSalt);

            const expectedHash = `${mockSalt}:${expectedDerivedKey}`;
            const result = await instance.hashPass({ password: passwordToHash });

            expect(result).toBe(expectedHash); //
        });
    });

    describe('method verify', () => {
        test('should hash its input according to #hashParams specs and return a string "salt:hashedPass"', async () => {
            const storedPass = '7f209f8866f5a55fe4b7e4cd82ded8f6:eef28ccfbbd21fdc6d012086bab478bf03e1b4ca573232a87a3249ca43d02c9daf6a305b2affb0c61d62016c7d18e8c3c3d65f38031796324701ce59cb181a57';
            const validInput = {
                password: passwordToHash,
                storedHash: storedPass,
            };
            const invalidInput = {
                password: 'invalidPassword',
                storedHash: storedPass,
            };
            const incompleteEntry = {storedHash: storedPass};

            expect(await instance.verify(validInput)).toBe(true);
            expect(await instance.verify(invalidInput)).toBe(false);
            await expect(instance.verify(incompleteEntry)).rejects.toThrow('Stored hash and password are required for verification.');
        });
    });
});