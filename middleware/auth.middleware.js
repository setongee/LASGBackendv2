const jwt = require("jsonwebtoken");
const { secret_key } = require("../configs/jwt.config");

const authenticateToken = (req, res, next) => {

    const authHeader = req.header("Authorization");

    if (!authHeader) {

        return res.status(401).json( { message : "Unathorized : Missing Token!" } );

    }

    const [bearer, token] = authHeader.split(" ");

    if (bearer !== 'Bearer' || !token ) {

        return res.status(401).json( { message : "Invalid token format!" } );

    }

    jwt.verify( token, secret_key, (err, user) => {

        if (err) {

            return res.status(403).json( {message : "Forbidden : Invalid Token!"} )

        }

        req.user = user;
        next();

    } )

}

module.exports = { authenticateToken };