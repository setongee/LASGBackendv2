const UploaderMiddleware = require("../services/uploader/uploader");
const Category = require("../models/service_category.model");
const ServicesData = require("../models/services.model");

const addCategory = async (req, res) => {

    try {

        const {icon, name} = req.body

        const category = await Category.create(req.body);
        
        if (Object.keys(icon).length) {
            
            await UploaderMiddleware(icon).then( async response => {

                category.icon = response.secure_url
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

const getSingleCategoryByName = async (req, res) => {

    try {

        const { name } = req.params;

        const category = await Category.find({formattedName : name});
        res.status(200).json({ status : "ok", message : "Fetched single data successfully...", data : category })
        
    } 
    catch (error) {

        res.status(500).json({message : error.message})
        
    }
}

const updateCategory = async (req, res) => {

    try {

        const { id } = req.params;
        const {name, formattedName, keywords} = req.body

        // const serve = await ServicesData.updateMany( {}, { $set : { keywordsGroup : {} } } );

        // console.log(serve)

        // await ServicesData.updateMany( {formattedName : formattedName}, { $set : { keywordsGroup : { [`${formattedName}`] : keywords } } } );

        await ServicesData.updateMany( {formattedName : formattedName}, { $set : { [`keywordsGroup.${formattedName}`] : keywords } } );

        // [{ $addFields: { some_key: new_info } }]
        
        const category = await Category.findByIdAndUpdate(id, req.body);

        category.formattedName = name.replaceAll(' ', '').replaceAll(',', '_').replaceAll('&', '_').toLowerCase();
        await category.save();

        if (req.body.icon.data !== undefined) {
            
            await UploaderMiddleware(req.body.icon).then( async response => {

                category.icon = response.secure_url
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
    deleteCategory,
    getSingleCategoryByName,

}