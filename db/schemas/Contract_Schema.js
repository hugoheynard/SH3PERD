import mongoose from "mongoose";
import {connectToMongo} from "../mongoDB_connect.js";


const Contract_Schema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff',
        required: true,
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    location: {
        type: String,
        required: true,
        enum: ['LFD Les Arcs', 'LFD Val d\'Isère', 'LFD Team'],
        trim: true
    },
    housing: {
        type: String,
        trim: true,
        required: false
    }
    //TODO: Settings (ex : does private)
});

const Contract = new mongoose.model('contract', Contract_Schema);

await connectToMongo()



export {Contract, Contract_Schema};