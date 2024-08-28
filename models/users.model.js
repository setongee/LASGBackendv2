const mongoose = require("mongoose");


////////// User Database ////////////

const userSchema = mongoose.Schema({

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
        required : true
    },

    password : {
        type : String,
        required : true
    },

    role : {
        type : String,
        required : true,
        default : "admin"
    }

},

{
    timestamps : true
}

);

const User = mongoose.model("users", userSchema);

module.exports = User;