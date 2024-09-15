import mongoose from "mongoose";

const Playlist = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff',
        required: true
    },
    trackList: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'music',
        required: false
    }],
    intensity: {
        type: Number,
        required: true
    },
    genre: {
        type: String,
        required: true
    }
})