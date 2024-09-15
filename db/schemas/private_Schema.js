import mongoose from "mongoose";


const private_Schema = new mongoose.Schema({
    date: {
        type: Date,
        required: true
    },
    privateType: {
        type: String,
        required: true,
        enum: ['corporate', 'moonlight', 'fondue', 'unlimited', 'LFD']
    },
    eventName: {
        type: String,
        required: false,
        default: 'privateEvent'
    },
    location: {
        type: [String],
        required: true
    },
    specs: {
        startTime: {
            type: Date,
            required: false
        },
        endTime: {
            type: Date,
            required: false
        }
    }
})

private_Schema.pre('save', function(next) {
    if (this.isModified('privateType') && !this.eventName) {
        this.eventName = this.privateType;
    }
    next();
});


private_Schema.pre('save', function(next) {
    /**
     * to facilitate user entry on usual types of private events,
     */
    if (this.isModified('privateType') && !this.specs.startTime) {
        this.specs.startTime = this.privateType;
    }
    next();
});