import {app_db} from "../../app.js";
import {DateMethod} from "../../Utilities/class_DateMethods.js";

export class CalendarRessourceProvider{
    constructor() {

    };
    async getActiveStaffPool(date) {
        return await app_db.collection('contracts')
            .aggregate([
                {
                    $match: {
                        startDate: { $lte: new Date(date) },
                        endDate: { $gte: new Date(date) }
                    }
                },
                {
                    $lookup: {
                        from: 'staffs',
                        localField: 'owner',
                        foreignField: '_id',
                        as: 'staff'
                    }
                },
                {
                    $unwind: "$staff"
                },
                {
                    $project: {
                        _id: 0,
                        staff: 1
                    }
                }

            ])
            .toArray()
            .then(res => res.map(entry => entry.staff))
        //.then(res => res.map(staff => staff._id.toString()));

    }

    async getCalendarEvents(date) {
        return await app_db.collection('calendar_events')
            .find({
                date: {
                    $gte: DateMethod.startOfDay(date),
                    $lt: DateMethod.endOfDay(date)
                }
            })
            .toArray()
    }
}