class TimetableAction {
    constructor(input) {
        this._timeTable = input.timetable;
    };
    get timeTable() {
        return this._timeTable;
    };

    allStaffMembersInTimetable() {
        const staff = [];

        for (const event of this.timeTable) {
            for (const staffMember of event.staff) {

                if (!staff.includes(staffMember)) {
                    staff.push(staffMember);
                }
            }
        }
        return staff;
    }
}

export {TimetableAction};