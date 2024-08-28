const mongoose = require("mongoose");

const executiveCouncilSchema = mongoose.Schema({

    fullname : {
        type : String,
        required : true
    },

    position : {
        type : String,
        required : true
    },

    phone : {
        type : String,
        required : true
    },

    email : {
        type : String,
        required : true
    },

    photo : {
        type : Object,
        required : true
    },

    content : {
        type : String,
        required : true
    }

},

{
    timestamps : true
}

)


const executive_council = mongoose.model("executive_council", executiveCouncilSchema);

module.exports = executive_council;