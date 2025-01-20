const {Mdas_Dataset} = require("../models/mda.model");

const addMda = async (req, res) => {

    try {

        const mdas = await Mdas_Dataset.create(req.body);
        res.status(200).json({ status : "ok", message : "MDA added successfully...", data : mdas});


    } catch (error) {

        res.status(500).json({ message: error.message });

    }

}

const getAllMdas = async (req, res) => {

    try {

        let count = await Mdas_Dataset.estimatedDocumentCount();
        const getMdas = await Mdas_Dataset.find({});
        res.status(200).json({data : getMdas, count : count});

    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}

const getSingleMda = async (req, res) => {

    try {

        const { id } = req.params;

        const getSingleMda = await Mdas_Dataset.findById(id);

        if (!getSingleMda) {

            res.status(404).json({ message: "Oops MDA not found!" })
        }

        else {

            res.status(200).json(getSingleMda);
        }

    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}

const updateMda = async (req, res) => {

    try {

        const { id } = req.params;

        const getSingleMdaAndUpdate = await Mdas_Dataset.findByIdAndUpdate(id, req.body);

        if (!getSingleMdaAndUpdate) {

            res.status(404).json({ message: "Oops MDA not found!" })
        }

        else{
            const updatedMda = await Mdas_Dataset.findById(id);
            res.status(200).json(updatedMda);
        }

    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}

const deleteMda = async (req, res) => {

    try {

        const { id } = req.params;
        const getSingleMdaAndDelete = await Mdas_Dataset.findByIdAndDelete(id);

        if (!getSingleMdaAndDelete) {

            res.status(404).json({ message: "Oops MDA not found!" })
        }

        else {
            res.status(200).json({message : "MDA deleted successfully!"});
        }


    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}

module.exports = {

    addMda,
    getAllMdas,
    getSingleMda,
    updateMda,
    deleteMda

}