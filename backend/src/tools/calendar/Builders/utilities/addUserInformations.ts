export interface AddUserInformationOutput {
    firstName?: string;
    functions?: {
        category?: string;
    }
}

export const addUserInformations = (user: any): AddUserInformationOutput => {
    return {
        firstName: user.firstName,
        functions: {
            category: user.functions ? user.functions.category : undefined
        }
    };
}