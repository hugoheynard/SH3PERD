import { randomUUID } from 'crypto';


export const generateUserId = (): string => {
    return randomUUID();
};