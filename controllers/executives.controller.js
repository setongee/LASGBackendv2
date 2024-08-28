const executives = require('../models/executives.model')
const UploaderMiddleware = require("../services/uploader/uploader");

const addExecutiveCouncilMember = async (req, res) => {

    try {

        const { photo } = req.body;

        const executivesRef = await executives.create(req.body);
        
        if (Object.keys(photo).length) {
            
            await UploaderMiddleware(photo).then( async response => {

                executivesRef.photo = response.secure_url
                await executivesRef.save();
    
            })
        }

        res.status(200).json({ status : "ok", message : "Council member added successfully..."});
        
    } 
    catch (error) {

        res.status(500).json({message : error.message})
        
    }
}

const getAllCouncilMembers = async (req, res) => {

    try {

        const executivesRef = await executives.find({});
        res.status(200).json({ status : "ok", message : "Fetched all data successfully...", data : executivesRef })
        
    } 
    catch (error) {

        res.status(500).json({message : error.message});
        
    }
}

const getSingleMember = async (req, res) => {

    try {

        const { id } = req.params;

        const executivesRef = await executives.findById(id);
        res.status(200).json({ status : "ok", message : "Fetched single data successfully...", data : await executivesRef })
        
    } 
    catch (error) {

        res.status(500).json({message : error.message})
        
    }

}

const updateExecutiveCouncilMember = async (req, res) => {

    try {

        const { id } = req.params;

        const executivesRef = await executives.findByIdAndUpdate(id, req.body);

        if (req.body.photo.data !== undefined) {
            
            await UploaderMiddleware(req.body.photo).then( async response => {

                executivesRef.photo = response.secure_url
                await executivesRef.save();
    
            })
        }

        if(executivesRef) {

            res.status(200).json({ status : "ok", message : "Executive member Updated successfully...", data : executivesRef })

        } else{

            res.status(404).json({ status : "error", message : "Executive member not found..." })

        }
        
    } 
    catch (error) {

        res.status(500).json({message : error.message})
        
    }
}

const deleteMember = async (req, res) => {    

    try {

        const { id } = req.params;

        const executivesRef = await executives.findByIdAndDelete(id);

        if(executivesRef) {

            res.status(200).json({ status : "ok", message : "Council member deleted successfully..." })

        } else{

            res.status(404).json({ status : "error", message : "Member id not found..." })

        }
        
    } 
    catch (error) {

        res.status(500).json({message : error.message})
        
    }
}

module.exports = {

    deleteMember,
    updateExecutiveCouncilMember,
    addExecutiveCouncilMember,
    getAllCouncilMembers,
    getSingleMember

}