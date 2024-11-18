const adminUser = require("../models/admin.model")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { secret_key } = require("../configs/jwt.config")

const register = async ( req, res ) => {

    console.log(req.body)

    try {

        const { email, password, role, firstname, lastname } = req.body
        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new adminUser({email, password : hashedPassword, role, lastname, firstname})
        await newAdmin.save();

        res.status(201).json({message : `Admin has been registered with ${email}`})

    } catch (error) {

        res.status(500).json({message : 'Something went wrong!'})
        
    }

}

const login = async ( req, res ) => {

    try {

        const { email, password } = req.body;

        const user = await adminUser.findOne({ email });

        if (!user){

            return res.status(404).json({message : `${email} not found`});
            
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch){
            return res.status(404).json({message : 'invalid credentials'});
        }

        const token = jwt.sign({
            id : user._id,
            email : user.emal,
            role : user.role
        }, secret_key, { expiresIn : "1h" } );

        res.status(200).json({token})
        
    } catch (error) {
        
    }


}

module.exports = {register, login};