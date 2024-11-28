const jwt = require("jsonwebtoken");
const { secret_key } = require("../configs/jwt.config");

const authenticateToken = (req, res, next) => {

    const authHeader = req.headers.Authorization || req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer")) {

        const [bearer, token] = authHeader.split(" ");

        if (!token) {

            return res.status(401).json( { message : "Unathorized : Missing Token!" } );
            
        }

        try {

            const decode = jwt.verify(token, secret_key);
            req.user = decode;
            console.log(`the requested user is ${req.user}`);
            next();

        } catch (error) {
            res.status(400).json({ message : `Token isn't valid!` })
        }

    }

}

module.exports = { authenticateToken };