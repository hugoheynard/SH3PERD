import mongoose from "mongoose";

const season_Schema = new mongoose.Schema({

    clubbingEndTiming : {
        monday: {
            type: String,
            trim: true
        },
        tuesday: {
            type: String,
            trim: true
        },
        wednesday: {
            type: String,
            trim: true
        },
        thursday: {
            type: String,
            trim: true
        },
        friday: {
            type: String,
            trim: true
        },
        saturday: {
            type: String,
            trim: true
        },
        sunday: {
            type: String,
            trim: true
        }
    },
    openingDay: {
        type: Date
    },
    closingDay: {
        type: Date
    },

})