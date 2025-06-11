import type { ObjectId } from "mongodb";
export interface User {
    _id: ObjectId | string;
    firstName?: string;
    lastName?: string;
    email: string;
    [key: string]: any;
}
export interface UsersQueryParams {
    [key: string]: any;
}
//# sourceMappingURL=User.d.ts.map