import {artistMockupDB} from "../../db/fakeDB.js";


class StaffMember {
    constructor(obj) {
        this._id = obj.staffMember_id;
        this._firstName = obj.firstName;
        this._lastName = obj.lastName;
        this._artistName = obj.artistName;
        this._planningDisplayName;
        this._jobCategory = obj.category;
        this._subCategory = obj.subCategory;
        this._contractSettings = obj.contractSettings;
    }

    get artistName() {
        // if member doesn't have an alias, generate one from first and last name

        if(this._artistName === null) {

            return this._firstName + " " + this._lastName;

        }

        return this._artistName;
    };

    get planningDisplayName() {
        // takes the initial of the first name
        return this._firstName[0];
    }

    get contractSettings() {
        return this._contractSettings;
    }

}


const staffMemberList = []
artistMockupDB.forEach(element => {
    staffMemberList.push(new StaffMember(element))
})



export {StaffMember}