import {ObjectId} from "mongodb";
import {DateMethod} from "../../Utilities/class_DateMethods.js";

export class UserQueryBuilder{
    constructor(input){
        this.authToken = input.authToken;

        this.req = input.req;

        return {
            _id: new ObjectId(this.authToken.user.id),
            /*
            date: {
                $gte: DateMethod.startOfDay(new Date(this.req.date)),
                $lt: DateMethod.endOfDay(new Date(this.req.date))
            },
            'participants': new ObjectId(this.authToken.user.id)

             */
        }
    };

}