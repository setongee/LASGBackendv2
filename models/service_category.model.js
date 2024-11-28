const mongoose = require("mongoose");

const CategorySchema = mongoose.Schema({

    name : {
        type : String,
        required : true
    },

    formattedName : {

        type : String

    },

    keywords : {
        type : Array,
        required : true
    },

    short : {

        type : String,
        required : true

    },

    icon : {
        type : Object,
        required : true
    },

    isOffline : {

        type : Boolean,
        default : false,
        required : true

    }
},

{
    timestamps : true
}

)


const Category = mongoose.model("service_category", CategorySchema);

module.exports = Category;