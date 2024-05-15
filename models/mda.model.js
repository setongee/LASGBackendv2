const mongoose = require("mongoose");

const MdaSchema = mongoose.Schema(

    {
        name : {
            type : String,
            required : [true, "Please enter the MDA Name"]
        },

        email : {
            type : String,
            required : true
        },

        agent_name : {
            type : String,
            required : true
        },

        subdomain : {
            type : String,
            required : true
        }
    },

   {
        timestamps : true
   }

);

const Mdas_Dataset = mongoose.model("mda", MdaSchema);

module.exports ={ Mdas_Dataset};  