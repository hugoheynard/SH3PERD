import {app_db} from "../../backend/appServer_dbConnections/atlas_uri.js";
import {ObjectId} from "mongodb";

export class ContractAction {
    constructor() {
    };
    get contracts() {
        return app_db.collection('contracts');
    };
    async createContract(formData) {
        await this.contracts.insertOne({
            owner: new ObjectId(formData.ownerID),
            startDate: new Date(formData.startDate),
            endDate: new Date(formData.endDate),
            location: formData.location
        });
    };
}