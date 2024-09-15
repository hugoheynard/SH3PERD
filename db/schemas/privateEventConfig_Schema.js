import mongoose, {Model} from "mongoose";


/**
 *
 */

const privateEventConfig_Schema = new mongoose.Schema({
    eventType: {
       type: String,
       required: true,
       trim: true
    },
    startTime_default: {
       type: String,
       required: true,
       validate: {
           validator: function(v) {
               return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);  // Regex pour HH:MM
           },
           message: props => `${props.value} is not a valid format!`
       }
   },
   endTime_default: {
       type: String,
       required: true,
       validate: {
           validator: function(v) {
               return /^([01]\d|2[0-3]):([0-5]\d)$/.test(v);  // Regex pour HH:MM
           },
           message: props => `${props.value} is not a valid format!`
       }
   }
});

const privateEventConfig = new Model('privateEventConfig', privateEventConfig_Schema)