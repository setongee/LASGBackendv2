const mongoose = require("mongoose");

const MdaSchema = mongoose.Schema(

    {
        name : {
            type : String,
            required : [true, "Please enter the MDA Name"]
        },

        type : {
            type : String,
            required : [true, "Please Select the Track Type"]
        },
        
        accessCode : {
            type : String,
            default : Math.floor(new Date().valueOf() * Math.random())
        },

        resetCode : {
            type : String
        },

        subdomain : {
            type : String,
            required : true
        },

        description : {
            type : String,
            required : true
        },

        email : {
            type : String,
            required : true
        },

        agent_name : {
            type : String,
            required : true
        },

        isOffline : {
            type : Boolean,
            default : false,
            required : true
        },

        info : { 

            type: mongoose.Types.ObjectId, 
            ref : "Mda_directory"

        },

        users : [

            {
                type: mongoose.Types.ObjectId,
                ref : "Users"
            }
        ]
    },

   {
        timestamps : true
   }

);

const Mdas_Dataset = mongoose.model("mda_site", MdaSchema);

module.exports ={ Mdas_Dataset};  