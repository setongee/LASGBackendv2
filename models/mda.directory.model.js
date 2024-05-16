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

        mda : { type : mongoose.Types.ObjectId, ref : "Mda_sites" }

    },

   {
        timestamps : true
   }

);

const Mda_Directory = mongoose.model("Mda_directory", MdaDirectorySchema);

module.exports = { Mda_Directory};  