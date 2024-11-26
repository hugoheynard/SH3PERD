import { ObjectId } from "mongodb";
export const userQueryBuilder = (input) => {
    const { authToken, req } = input;
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
    };
};
//# sourceMappingURL=UserQueryBuilder.js.map