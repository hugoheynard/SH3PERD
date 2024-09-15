import mongoose from "mongoose";

const jobCategories_Schema = new mongoose.Schema({
    category: {
        type: String,
        required: true,
        trim: true
    },
    subCategories: {
        type: [String]
    }
})