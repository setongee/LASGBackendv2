const User = require("../../models/admin.model");
const bcrypt = require("bcrypt")

const register = async (request) => { 

    const userData = await User.create(request);

    userData.password = await bcrypt.hash(userData.password, 10);
    userData.save();

    return userData;
    
}

module.exports = register;