import {app_db} from "../../app.js";
import {DateMethod} from "../../Utilities/class_DateMethods.js";

/**
 * @method activeStaffPool: go through the contracts and find the staff on active period, returns array
 */
export class CalendarRessourceProvider{
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

    };
    async getCalendarEvents(date) {

        if (!date || isNaN(new Date(date).getTime())) {
            throw new Error("Invalid date provided");
        }

        try {
            return await app_db.collection('calendar_events')
                .find({
                    date: {
                        $gte: DateMethod.startOfDay(date),
                        $lt: DateMethod.endOfDay(date)
                    }
                })
                .toArray()
        }catch (err) {
            console.error("Error retrieving calendar events:", err);
            throw err;
        }

    };

}