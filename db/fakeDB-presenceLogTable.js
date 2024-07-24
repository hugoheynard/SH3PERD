//structureDBB_table presence sheet
//date (PRIMARY_KEY), staffMemberID, rehearsal, meeting, halfDay1, halfDay2, private, morningTravel, eveningTravel
// null true false


const presenceLogTable = [
    {
    date : "sun",
    staffMembers: {
        1: {
            sickDay : false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            morningTravel: null,
            rehearsal: null,
            meeting: null,
            halfDay1: true,
            halfDay2: true,
            private: true,
            eveningTravel: null
        },
        2: {
            sickDay : false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            morningTravel: null,
            rehearsal: null,
            meeting: null,
            halfDay1: true,
            halfDay2: true,
            private: true,
            eveningTravel: null
        }
        }

    }

]


export {presenceLogTable} // goes into fake DB for the moment