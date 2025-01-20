const mongoose = require("mongoose");

const MdaDirectorySchema = mongoose.Schema(

    {
        name : {
            type : String
        },

        agencies : {
            type : Array
        },

        mission : {type : String, default : ""},
        
        vision : {type : String, default : ""},

        responsibilities : { type : String },

        people : {
            type : Array
        },

        contact : {

            email : {type : String, default : ""},
            phone : {type : String, default : ""},
            address : {type : String, default : ""},
            socials : {}

        }

    },

   {
        timestamps : true
   }

);

const Mda_Directory = mongoose.model("mda_directory", MdaDirectorySchema);

module.exports = { Mda_Directory};  