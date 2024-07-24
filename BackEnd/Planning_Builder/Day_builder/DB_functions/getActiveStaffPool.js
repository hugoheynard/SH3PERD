import {artistMockupDB} from "../../../../db/fakeDB.js";
//On récupère en sortie les artistes qui ont des dates de contrats valides, à changer en requete BDD plus tard


const getActiveStaffPool = date => {

    const staffPool = [];

    const table = artistMockupDB;

    const artistContractDatesValid = (staffMember, date) => staffMember.contractSettings.startDate <= date && staffMember.contractSettings.endDate >= date;

    table.forEach(artist => {

        if(artistContractDatesValid(artist, date)) {

            staffPool.push(artist);

        }

    });

    return staffPool;
}

export {getActiveStaffPool};