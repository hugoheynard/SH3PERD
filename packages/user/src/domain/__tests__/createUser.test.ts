import {createUser} from "../../index";
import type {CreateUserInput} from "../types";


describe('createUser', () => {
    const fakeId = 'user_fake-id-123' as const;

    it('should return a user with correct properties', () => {
        const input: CreateUserInput = {
            email: 'user@example.com',
            password: 'hashedPassword123',
            user_id: fakeId,
        };

        const result = createUser(input);

        expect(result).toEqual({
            user_id: fakeId,
            email: input.email,
            password: input.password,
            created_at: expect.any(Date),
            updated_at: expect.any(Date),
        });
    });

    it('should generate different timestamps on each call', async () => {
        const baseInput = {
            email: 'user@example.com',
            password: 'securepwd',
            user_id: fakeId,
        };

        const user1 = createUser(baseInput);

        await new Promise(res => setTimeout(res, 10));

        const user2 = createUser(baseInput);

        expect(user1.created_at.getTime()).toBeLessThan(user2.created_at.getTime());
        expect(user1.updated_at.getTime()).toBeLessThan(user2.updated_at.getTime());
    });
});