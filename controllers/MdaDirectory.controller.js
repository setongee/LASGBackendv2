const { Mda_Directory } = require("../models/mda.directory.model");


const addMdaDirectory = async (req, res) => {

    try {

        const mdaDirectory = await Mda_Directory.create(req.body);
        res.status(200).json(mdaDirectory);

    } catch (error) {

        res.status(500).json({ message: error.message });

    }

}

const getAllMdaDirectory = async (req, res) => {

    try {

        const getMdaDirectory = await Mda_Directory.find({});
        res.status(200).json(getMdaDirectory);

    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}

const getSingleMdaDirectory = async (req, res) => {

    try {

        const { id } = req.params;

        const getSingleMdaDirectory = await Mda_Directory.findById(id);

        if (!getSingleMdaDirectory) {

            res.status(404).json({ message: "Oops MDA not found!" })
        }

        else {

            res.status(200).json(getSingleMdaDirectory);
        }

    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}

const updateMdaDirectory = async (req, res) => {

    try {

        const { id } = req.params;

        const getSingleMdaAndUpdateDirectory = await Mda_Directory.findByIdAndUpdate(id, req.body);

        if (!getSingleMdaAndUpdateDirectory) {

            res.status(404).json({ message: "Oops MDA not found!" })
        }

        const updatedMdaDirectory = await Mda_Directory.findById(id);
        res.status(200).json(updatedMdaDirectory);

    } catch (error) {

        res.status(500).json({ message: error.message })

    }

}

const deleteMdaDirectory = async (req, res) => {

    try {

        const { id } = req.params;
        const getSingleMdaAndDeleteDirectory = await Mda_Directory.findByIdAndDelete(id);

        if (!getSingleMdaAndDeleteDirectory) {

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

   addMdaDirectory,
   getAllMdaDirectory,
   updateMdaDirectory,
   deleteMdaDirectory,
   getSingleMdaDirectory

}