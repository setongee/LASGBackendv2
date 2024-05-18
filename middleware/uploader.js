const cloudinary =  require("cloudinary");
require("dotenv").config();

const UploaderMiddleware = async (data) => {

    // Configuration
    cloudinary.v2.config({ 
        cloud_name : process.env.CLOUD_NAME , 
        api_key : process.env.API_KEY, 
        api_secret : process.env.API_SECRET
    });
    
    // Upload an image
    const uploadResult = await cloudinary.v2.uploader.upload( data.data , {
        public_id: data.temp
    }).catch((error)=>{console.log(error)});
    
    
    // Optimize delivery by resizing and applying auto-format and auto-quality
    const optimizeUrl = cloudinary.v2.url(data.temp, {
        fetch_format: 'auto',
        quality: 'auto'
    });
    
    // Transform the image: auto-crop to square aspect_ratio
    const autoCropUrl = cloudinary.v2.url(data.temp, {
        crop: 'auto',
        gravity: 'auto',
        width: 500,
        height: 500,
    });


    return optimizeUrl;

};

module.exports = UploaderMiddleware;