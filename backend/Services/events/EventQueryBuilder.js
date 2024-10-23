import {ObjectId} from "mongodb";
import {DateMethod} from "../../Utilities/class_DateMethods.js";

export class EventQueryBuilder{
    constructor(input){
        this.authToken = input.authToken;
        this.req = input.req;

        return {
            'company': new ObjectId(this.authToken.company.id),
            date: {
                $gte: DateMethod.startOfDay(new Date(this.req.date)),
                $lt: DateMethod.endOfDay(new Date(this.req.date))
            },
            'participants': new ObjectId(this.authToken.user.id)
        }
    };

}