const news = require("../models/news.model");
const UploaderMiddleware = require("../services/uploader/uploader");

const addNews = async (req, res) => {

    try {

        const {photo} = req.body

        const newsRef = await news.create(req.body);
        
        if (Object.keys(photo).length) {
            
            await UploaderMiddleware(photo).then( async response => {

                newsRef.photo = response.secure_url
                await newsRef.save();
    
            })
        }

        res.status(200).json({ status : "ok", message : "News added successfully..."});
        
    } 
    catch (error) {

        res.status(500).json({message : error.message})
        
    }
}

const getAllNews = async (req, res) => {

    try {

        const newsRef = await news.find({});
        res.status(200).json({ status : "ok", message : "Fetched all data successfully...", data : newsRef })
        
    } 
    catch (error) {

        res.status(500).json({message : error.message});
        
    }
}

const getNewsForMda = async (req, res) => {

    try {

        const { id } = req.params;

        const newsRef = await news.find({mda : id});
        res.status(200).json({ status : "ok", message : "Fetched all data successfully...", data : await newsRef })
        
    } 
    catch (error) {

        res.status(500).json({message : error.message})
        
    }
}

const getSingleNews = async (req, res) => {

    try {

        const { id } = req.params;

        const newsRef = await news.findById(id);
        res.status(200).json({ status : "ok", message : "Fetched single data successfully...", data : await newsRef })
        
    } 
    catch (error) {

        res.status(500).json({message : error.message})
        
    }

}

const updateNews = async (req, res) => {

    try {

        const { id } = req.params;

        const newsRef = await news.findByIdAndUpdate(id, req.body);

        if (req.body.photo.data !== undefined) {
            
            await UploaderMiddleware(req.body.photo).then( async response => {

                newsRef.photo = response.secure_url
                await newsRef.save();
    
            })
        }

        if(newsRef) {

            res.status(200).json({ status : "ok", message : "News item Updated successfully...", data : newsRef })

        } else{

            res.status(404).json({ status : "error", message : "News not found..." })

        }
        
    } 
    catch (error) {

        res.status(500).json({message : error.message})
        
    }
}

const deleteNews = async (req, res) => {    

    try {

        const { id } = req.params;

        const newsRef = await news.findByIdAndDelete(id);

        if(newsRef) {

            res.status(200).json({ status : "ok", message : "News deleted successfully..." })

        } else{

            res.status(404).json({ status : "error", message : "Category not found..." })

        }
        
    } 
    catch (error) {

        res.status(500).json({message : error.message})
        
    }
}

module.exports = {

    deleteNews,
    updateNews,
    addNews,
    getAllNews,
    getSingleNews,
    getNewsForMda

}