const mongoose = require("mongoose");

const CategorySchema = mongoose.Schema({

    name : {
        type : String,
        required : true
    },

    formattedName : {

        type : String

    },

    description : {

        type : String,
        required : true

    },

    icon : {
        type : Object
    },

    disabled : {

        type : Boolean,
        default : false,
        required : true

    },

    services : [{
        type : mongoose.Types.ObjectId,
        ref : "service"
    }]

},

{
    timestamps : true
}

)


const Category = mongoose.model("service_category", CategorySchema);

module.exports = Category;