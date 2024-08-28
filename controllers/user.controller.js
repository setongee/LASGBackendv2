const { getAllUsers } = require("../services/user/getUser");
const Login = require("../services/user/login");
const register = require("../services/user/signUp")

const registerUser = async (req, res) => {

   try {

    const user = await register(req.body);

    res.status(201).json({ status : "ok", message : "User created successfully...", data : await user });
    
   } catch (error) {

        res.status(500).json({message : error.message})
    
   }

}

const loginUser = async (req, res) => {

    try {

        const {email, password} = req.body;
        const userToken = await Login(email, password);

        res.json({token : userToken})
        
    } catch (error) {

        res.status(401).json({status : "Invalid Credentials", message : error.message})
        
    }


}

const getUsers = async (req, res) => {

    try {

        const usersData = await getAllUsers();
        
        res.status(200).json({status : "ok", message : "Fetched all users successfully...", data : usersData } )
        
    } catch (error) {
        
        res.status(500).json({message : error.message});
    }

}


module.exports = {registerUser, loginUser, getUsers};