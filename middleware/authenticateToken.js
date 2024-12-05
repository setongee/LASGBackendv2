const jwt = require("jsonwebtoken");
const { secret_key } = require("../configs/jwt.config");

const authenticateToken2 = (req, res) => {

    const { token } = req.body

    if (token) {

        try {

            const decode = jwt.verify(token, secret_key);
            req.user = decode;

            return res.status(200).json( { status : "ok",  message : "Gotten user details", data : {...req.user} } );


        } catch (error) {
            return res.status(200).json({ status : "bad", message : `Token isn't valid!` })
        }

    } else {
        return res.status(200).json( { status : "bad", message : "Unathorized : Missing Token!" } );
    }

}

module.exports = { authenticateToken2 };