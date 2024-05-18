const mongoose = require("mongoose");

const MdaDirectorySchema = mongoose.Schema(

    {
        name : {
            type : String
        },

        about : {

            mission : {type : String, default : ""},
            vision : {type : String, default : ""},
            past_commissioners : [],
            other : {type : String, default : ""},
        },

        responsibilities : { type : String },

        principal_officers : [],

        news : [ { type : mongoose.Types.ObjectId, ref : "News" } ],      

        contact : {

            email : {type : String, default : ""},
            phone : {type : String, default : ""},
            address : {type : String, default : ""},
            socials : []

        },

        parent : { type : mongoose.Types.ObjectId, ref : "mda_site" }

    },

   {
        timestamps : true
   }

);

const Mda_Directory = mongoose.model("mda_directory", MdaDirectorySchema);

module.exports = { Mda_Directory};  