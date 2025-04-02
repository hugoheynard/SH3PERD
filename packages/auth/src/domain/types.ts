export type THashPasswordFunction = (input: { password: string }) => Promise<string>;
export type TComparePasswordFunction = (input: { password: string; hashedPassword: string }) => Promise<boolean>;