import mongoose from "mongoose";

const calendarEvent_Schema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true,
    },
    eventType: {
        type: String,
        required: true,
        enum: ['show', 'rehearsal', 'meeting']
    },
    staff: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'staff',
        required: true
    }],
    description: {
        type: String,
    }
}, {discriminatorKey: 'eventType'});

const eventShow_Schema = new mongoose.Schema({
    techInstall: {
        type: Boolean,
        required: false
    },
    techAssist: {
        type: Boolean,
        required: false
    }
})

const Event_Show = calendarEvent_Schema.discriminator('show', eventShow_Schema);


export {calendarEvent_Schema};