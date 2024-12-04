const authorizeRoles = (...allowedRoles) => {

    return (req, res, next) =>{

        if (!allowedRoles.includes(req.user.role)){

            return res.status(403).json({status : "denied", message : "Access Denied!"})

        }
        next();
    }

}

module.exports = authorizeRoles;