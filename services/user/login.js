const User = require("../../models/users.model");
const { generateToken } = require("../../utils/jwt.utils");
const bcrypt = require("bcrypt");

const Login = async(email, password) => {

    const existingUser = await User.findOne( { email } );
   

    if (!existingUser) {

        return {
            status : "error",
            message : "User not found!"
        }

    }

    const isPasswordValid = await bcrypt.compare(password, existingUser.password);

    if (!isPasswordValid) {

        return {
            status : "error",
            message : "Password is incorrect!"
        }

    }
    
    const token = generateToken(existingUser);
    return token;

}

module.exports = Login;

