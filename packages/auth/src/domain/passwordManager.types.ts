export type ICompareResult = {
    isValid: boolean;
    wasRehashed: boolean;
    newHash?: string;
}

//PasswordManager Functions
export type THashPassword = (input: { password: string }) => Promise<string>;
export type TComparePassword = (input: { password: string; hashedPassword: string }) => Promise<ICompareResult>;