const User = require("../../models/users.model");

const getAllUsers = async () => {

    const users = await User.find({});
    return users;

}

module.exports = {getAllUsers}