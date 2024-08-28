const services = require("../../models/services.model");


const get_single_custom_service = async (id) => {

    const serviceRef = await services.findById(id);
    return serviceRef;

}

module.exports = get_single_custom_service;