const mongoose = require("mongoose");

const eventsSchema = mongoose.Schema({

    title : {
        type : String,
        required : true
    },

    date : {
        type : Object,
        required : true
    },

    mda : {
        type : String
    },

    categories : {
        type : Array,
        required : true
    },

    photo : {
        type : Object,
        required : true
    },

    content : {
        type : String,
        required : true
    },

    attendees : {
        type : Array
    },

},

{
    timestamps : true
}

)


const events = mongoose.model("events", eventsSchema);

module.exports = events;