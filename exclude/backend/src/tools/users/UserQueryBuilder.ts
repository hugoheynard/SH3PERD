import {ObjectId} from "mongodb";

export interface UserQueryBuilderInput {
    authToken: any;
    req: any;
}

export const userQueryBuilder = (input: UserQueryBuilderInput): any => {
    const {authToken, req} = input;

    if (!authToken || !authToken.user) {
        throw new Error("authToken or user is undefined");
    }

    return {
        _id: new ObjectId(authToken.user.id),
        /*
        date: {
            $gte: DateMethod.startOfDay(new Date(this.req.date)),
            $lt: DateMethod.endOfDay(new Date(this.req.date))
        },
        'participants': new ObjectId(this.authToken.user.id)

         */
    }
}