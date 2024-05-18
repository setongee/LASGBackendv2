const UploaderMiddleware = require("../middleware/uploader");
const Category = require("../models/service_category.model");

const addCategory = async (req, res) => {

    try {

        const {icon, name} = req.body

        const category = await Category.create(req.body);
        
        if (Object.keys(icon).length) {
            
            await UploaderMiddleware(icon).then( async response => {

                category.icon = response
                await category.save();
    
            })
        }

        category.formattedName = name.replaceAll(' ', '').replaceAll(',', '_').replaceAll('&', '_').toLowerCase();
        await category.save();

        res.status(200).json({ status : "ok", message : "Service category added successfully..."});
        
    } 
    catch (error) {

        res.status(500).json({message : error.message})
        
    }
}

const getAllCategories = async (req, res) => {

    try {


        const categories = await Category.find({});
        res.status(200).json({ status : "ok", message : "Fetched all data successfully...", data : categories })
        
    } 
    catch (error) {

        res.status(500).json({message : error.message})
        
    }
}

const getSingleCategory = async (req, res) => {

    try {

        const { id } = req.params;

        const category = await Category.findById(id);
        res.status(200).json({ status : "ok", message : "Fetched single data successfully...", data : category })
        
    } 
    catch (error) {

        res.status(500).json({message : error.message})
        
    }
}

const updateCategory = async (req, res) => {

    try {

        const { id } = req.params;
        const {name} = req.body

        const category = await Category.findByIdAndUpdate(id, req.body);

        category.formattedName = name.replaceAll(' ', '').replaceAll(',', '_').replaceAll('&', '_').toLowerCase();
        await category.save();

        if (req.body.icon) {
            
            await UploaderMiddleware(req.body.icon).then( async response => {

                category.icon = response
                await category.save();
    
            })
        }

        if(category) {

            res.status(200).json({ status : "ok", message : "Updated successfully...", data : category })

        } else{

            res.status(404).json({ status : "error", message : "Category not found..." })

        }
        
    } 
    catch (error) {

        res.status(500).json({message : error.message})
        
    }
}

const deleteCategory = async (req, res) => {    

    try {

        const { id } = req.params;

        const category = await Category.findByIdAndDelete(id);

        if(category) {

            res.status(200).json({ status : "ok", message : "Category deleted successfully..." })

        } else{

            res.status(404).json({ status : "error", message : "Category not found..." })

        }
        
    } 
    catch (error) {

        res.status(500).json({message : error.message})
        
    }
}

module.exports = {

    addCategory,
    getAllCategories,
    getSingleCategory,
    updateCategory,
    deleteCategory

}