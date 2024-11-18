const Category = require("../models/service_category.model");
const services = require("../models/services.model");
const addcustom_service = require("../services/custom_serrvices/addService");
const get_single_custom_service = require("../services/custom_serrvices/getSingleService");


const addService = async (req, res) => {

   try {

    const addedService = await addcustom_service(req.body);

    res.status(200).json( await addedService);
    
   } catch (error) {

    res.status(500).json({message : error.message})
    
   }

}


const getSingleService = async (req, res) => {

    const {id} = req.params;

    try {

        const singleService = await get_single_custom_service(id)

        if (singleService) {

            res.status(200).json( { status : "ok", message : "Gotten the data", data : await singleService });

        } else {

            res.status(404).json({status : "error", message : "Failed to fetch data" })

        }
        
    } catch (error) {

        res.status(500).json({message : error.message})
        
    }

}

const getServicesByCategory = async (req, res) => {

    const {category} = req.params;

    const getCategory = await Category.findOne({formattedName : category});

    if (getCategory) {

        res.status(200).json({status : "ok", message : "Fetched data successfully...", data : await getCategory.populate("services") })

    } else {

        res.status(404).json({status : "error", message : "Failed to fetch data" })

    }

}

const getServicesByTag = async (req, res) => {

    const {category} = req.params;

    const getService = await services.find({formattedName : category});

    if (getService) {

        res.status(200).json({status : "ok", message : "Fetched data successfully...", data : getService })

    } else {

        res.status(404).json({status : "error", message : "Failed to fetch data" })

    }

}

const getAllServices = async (req, res) => {
    
    const serviceRef = await services.find({});

    if (serviceRef) {

        res.status(200).json({status : "ok", message : "Fetched all services successfully...", data : serviceRef })

    } else {

        res.status(404).json({status : "error", message : "Failed to fetch data" })

    }

}

const updateService = async (req, res) => {

    const {id} = req.params;
    const serviceRef = await services.findByIdAndUpdate(id, req.body);

    if (serviceRef) {

        res.status(200).json({status : "ok", message : "Updated service successfully..." })

    } else {

        res.status(404).json({status : "error", message : "Failed to fetch data" })

    }

}

const deleteService = async (req, res) => {

    const {id} = req.params;
    const serviceRef = await services.findByIdAndDelete(id);

    if (serviceRef) {

        res.status(200).json({status : "ok", message : "Deleted service successfully..." })

    } else {

        res.status(404).json({status : "error", message : "No service to delete" })

    }

}


module.exports = { addService, getAllServices, getSingleService, updateService, deleteService, getServicesByCategory, getServicesByTag }