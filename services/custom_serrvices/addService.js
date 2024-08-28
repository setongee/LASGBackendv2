const Category = require("../../models/service_category.model");
const services = require("../../models/services.model");

const addcustom_service = async (request) => {

    const serviceRef = await services.create(request);
    return serviceRef;
}

module.exports = addcustom_service;