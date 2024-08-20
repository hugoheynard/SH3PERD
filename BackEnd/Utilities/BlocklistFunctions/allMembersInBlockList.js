class TimetableAction {
    constructor(input) {
        this._timeTable = input.timetable;
    };
    get timeTable() {
        return this._timeTable;
    };

    allStaffMembersInTimetable() {
        const staff = [];

        for (const block of this.timeTable) {
            for (const staffMember of block.staff) {

                if (!staff.includes(staffMember)) {
                    staff.push(staffMember);
                }
            }
        }
        return staff;
    }
}

export {TimetableAction};