const mongoose = require("mongoose");


////////// User Database ////////////

const mofUser = mongoose.Schema({

    firstname : {
        type : String,
        required : true
    },

    lastname : {
        type : String,
        required : true
    },

    email : {
        type : String,
        required : true,
        unique : true
    },

    lastLogin : {
        type : String
    },

    password : {
        type : String,
        required : true
    },

    role : {
        type : String,
        required : true,
        enum : ["admin", "comms", "ict"]
    },

},

{
    timestamps : true
}

);

const User = mongoose.model("mofUser", mofUser);

module.exports = User;