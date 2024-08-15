
const art1 = {
    staffMember_id:1,
    firstName:"Hugo",
    lastName:"Heynard",
    artistName: "IKITAI",
    category:"dj",
    subCategory: null,
    contractSettings:{
        startDate: "2024-11-01",
        endDate: "2025-05-26",
        doesPrivateEvents: true
    },
    presenceLog: {
        "sun": {
            sickDay : false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: null,
                meeting: null,
                halfDay1: true,
                halfDay2: true,
                private: false
            },
            morningTravel: null,
            eveningTravel: null
        },
        "mon": {
            sickDay: false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: null,
                meeting: null,
                halfDay1: true,
                halfDay2: true,
                private: true
            },
            morningTravel: null,
            eveningTravel: null
        }
    }
}

const art2 = {
    staffMember_id:2,
    firstName:"Tanguy",
    lastName:"Paummier",
    artistName: "Mike Send",
    category:"dj",
    subCategory: null,
    contractSettings: {
        startDate: "2024-11-01",
        endDate: "2025-05-26",
        doesPrivateEvents: true
    },
    presenceLog: {
        "sun": {
            sickDay : false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: null,
                meeting: null,
                halfDay1: true,
                halfDay2: true,
                private: true
            },
            morningTravel: null,
            eveningTravel: null
        },
        "mon": {
            sickDay: false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: null,
                meeting: null,
                halfDay1: false,
                halfDay2: true,
                private: false
            },
            morningTravel: null,
            eveningTravel: null
        }
    }
}

const art3 = {
    staffMember_id:3,
    firstName:"Antoine",
    lastName:"Bonomi",
    artistName: null,
    category:"dj",
    subCategory: null,
    contractSettings:{
        startDate: "2024-11-01",
        endDate: "2025-05-26",
        doesPrivateEvents: false
    },
    presenceLog: {
        "sun": {
            sickDay : false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: null,
                meeting: null,
                halfDay1: false,
                halfDay2: true,
                private: false
            },
            morningTravel: null,
            eveningTravel: null
        },
        "mon": {
            sickDay: false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: null,
                meeting: null,
                halfDay1: true,
                halfDay2: true,
                private: false
            },
            morningTravel: null,
            eveningTravel: null
        }
    }
}

const art4 = {
    staffMember_id:4,
    firstName:"Gregoire",
    lastName:"Nogier",
    artistName: "Greg'nSax",
    category:"musician",
    subCategory:"saxo",
    contractSettings: {
        startDate: "2024-11-01",
        endDate: "2025-05-26",
        doesPrivateEvents: true
    },
    presenceLog: {
        "sun": {
            sickDay : false,
            offDay_weekly: true,
            offDay_additional: false,
            workingDay: false,
            workingBlocks:{
                rehearsal: null,
                meeting: null,
                halfDay1: null,
                halfDay2: false,
                private: false
            },
            morningTravel: null,
            eveningTravel: null
        },
        "mon": {
            sickDay: false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: null,
                meeting: null,
                halfDay1: true,
                halfDay2: true,
                private: true
            },
            morningTravel: null,
            eveningTravel: null
        }
    }
}

const art5 = {
    staffMember_id:5,
    firstName:"David",
    lastName:"Arrow",
    artistName: "ArrowJazz",
    category:"musician",
    subCategory:"guit",
    contractSettings: {
        startDate: "2024-11-01",
        endDate: "2025-05-26",
        doesPrivateEvents: true
    },
    presenceLog: {
        "sun": {
            sickDay : true,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: null,
                meeting: null,
                halfDay1: true,
                halfDay2: true,
                private: true
            },
            morningTravel: null,
            eveningTravel: null
        },
        "mon": {
            sickDay: false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: null,
                meeting: null,
                halfDay1: true,
                halfDay2: true,
                private: true
            },
            morningTravel: null,
            eveningTravel: null
        }
    }
}

const art6 = {
    staffMember_id:6,
    firstName:"David",
    lastName:"Debaene",
    artistName: "Doudou",
    category:"dancer",
    subCategory:"cabaret",
    contractSettings: {
        startDate: "2024-11-01",
        endDate: "2025-05-26",
        doesPrivateEvents: true
    },
    presenceLog: {
        "sun": {
            sickDay : false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: true,
                meeting: true,
                halfDay1: true,
                halfDay2: true,
                private: true
            },
            morningTravel: null,
            eveningTravel: null
        },
        "mon": {
            sickDay: false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: false,
                meeting: null,
                halfDay1: true,
                halfDay2: true,
                private: true
            },
            morningTravel: null,
            eveningTravel: null
        }
    }
}

const art7 = {
    staffMember_id:7,
    firstName:"Gerard",
    lastName:"Rouyou",
    artistName: "Gege",
    category:"dancer",
    subCategory:"cabaret",
    contractSettings: {
        startDate: "2024-11-01",
        endDate: "2025-05-26",
        doesPrivateEvents: true
    },
    presenceLog: {
        "sun": {
            sickDay : false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: true,
                meeting: true,
                halfDay1: true,
                halfDay2: true,
                private: true
            },
            morningTravel: null,
            eveningTravel: null
        },
        "mon": {
            sickDay: false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: null,
                meeting: null,
                halfDay1: true,
                halfDay2: true,
                private: true
            },
            morningTravel: null,
            eveningTravel: null
        }
    }
}

const art8 = {
    staffMember_id:8,
    firstName:"Roger",
    lastName:"Rabbit",
    artistName: "bunny",
    category:"dancer",
    subCategory:"cabaret",
    contractSettings: {
        startDate: "2024-11-01",
        endDate: "2025-05-26",
        doesPrivateEvents: true
    },
    presenceLog: {
        "sun": {
            sickDay : false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: null,
                meeting: true,
                halfDay1: true,
                halfDay2: true,
                private: true
            },
            morningTravel: null,
            eveningTravel: null
        },
        "mon": {
            sickDay: false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: null,
                meeting: null,
                halfDay1: true,
                halfDay2: true,
                private: true
            },
            morningTravel: null,
            eveningTravel: null
        }
    }
}

const art9 = {
    staffMember_id:9,
    firstName:"Sophie",
    lastName:"LaGiraffe",
    artistName: "SLG",
    category:"dancer",
    subCategory:"cabaret",
    contractSettings: {
        startDate: "2024-11-01",
        endDate: "2025-05-26",
        doesPrivateEvents: true
    },
    presenceLog: {
        "sun": {
            sickDay : false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: null,
                meeting: true,
                halfDay1: true,
                halfDay2: true,
                private: true
            },
            morningTravel: null,
            eveningTravel: null
        },
        "mon": {
            sickDay: false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: null,
                meeting: null,
                halfDay1: true,
                halfDay2: true,
                private: true
            },
            morningTravel: null,
            eveningTravel: null
        }
    }
}

const art10 = {
    staffMember_id:10,
    firstName:"Martine",
    lastName:"Aubrie",
    artistName: null,
    category:"dancer",
    subCategory:"aerial",
    contractSettings: {
        startDate: "2024-11-01",
        endDate: "2025-05-26",
        doesPrivateEvents: true
    },
    presenceLog: {
        "sun": {
            sickDay : false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: true,
                meeting: false,
                halfDay1: true,
                halfDay2: true,
                private: true
            },
            morningTravel: null,
            eveningTravel: null
        },
        "mon": {
            sickDay: false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: null,
                meeting: null,
                halfDay1: true,
                halfDay2: true,
                private: true
            },
            morningTravel: null,
            eveningTravel: null
        }
    }
}

const art11 = {
    staffMember_id:11,
    firstName:"Nathalie",
    lastName:"Makoma",
    artistName: "Queen makoma",
    category:"singer",
    subCategory:"club",
    contractSettings: {
        startDate: "2024-11-01",
        endDate: "2025-05-26",
        doesPrivateEvents: true
    },
    presenceLog: {
        "sun": {
            sickDay : false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: false,
                meeting: false,
                halfDay1: true,
                halfDay2: true,
                private: false
            },
            morningTravel: null,
            eveningTravel: null
        },
        "mon": {
            sickDay : false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: false,
                meeting: false,
                halfDay1: true,
                halfDay2: true,
                private: false
            },
            morningTravel: null,
            eveningTravel: null
        }
    }
}

const art12 = {
    staffMember_id:12,
    firstName:"Andre",
    lastName:"Blurg",
    artistName: null,
    category:"singer",
    subCategory:"club",
    contractSettings: {
        startDate: "2024-11-01",
        endDate: "2025-05-26",
        doesPrivateEvents: true
    },
    presenceLog: {
        "sun": {
            sickDay : false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: false,
                meeting: false,
                halfDay1: true,
                halfDay2: true,
                private: false
            },
            morningTravel: null,
            eveningTravel: null
        },
        "mon": {
            sickDay : false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: false,
                meeting: false,
                halfDay1: true,
                halfDay2: true,
                private: false
            },
            morningTravel: null,
            eveningTravel: null
        }
    }
}

const art13 = {
    staffMember_id:13,
    firstName:"Jesse",
    lastName:"Tanche",
    artistName: null,
    category:"singer",
    subCategory:"club",
    contractSettings: {
        startDate: "2024-11-01",
        endDate: "2025-05-26",
        doesPrivateEvents: true
    },
    presenceLog: {
        "sun": {
            sickDay : false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: false,
                meeting: false,
                halfDay1: true,
                halfDay2: true,
                private: false
            },
            morningTravel: null,
            eveningTravel: null
        },
        "mon": {
            sickDay : false,
            offDay_weekly: false,
            offDay_additional: false,
            workingDay: true,
            workingBlocks:{
                rehearsal: false,
                meeting: false,
                halfDay1: true,
                halfDay2: true,
                private: false
            },
            morningTravel: null,
            eveningTravel: null
        }
    }
}

const artistMockupDB = [art1, art2, art3, art4, art5, art6, art7, art8, art9, art10, art11, art12, art13];

export {artistMockupDB, art1, art2, art3, art4, art5, art6, art7, art8, art9, art10, art11, art12, art13};
