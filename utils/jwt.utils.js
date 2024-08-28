const jwt = require('jsonwebtoken');
const { secret_key } = require('../configs/jwt.config');

const generateToken = (user) => {

    const payload = {

        id : user._id,
        email : user.email,
        role : user.role

    }

    return jwt.sign( payload, secret_key, { expiresIn : "1hr" } )

};

module.exports = {
    generateToken
}
