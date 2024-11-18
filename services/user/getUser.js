const User = require("../../models/admin.model");

const getAllUsers = async () => {

    const users = await User.find({});
    return users;

}

module.exports = {getAllUsers}