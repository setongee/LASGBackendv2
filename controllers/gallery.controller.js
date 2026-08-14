const Gallery = require("../models/gallery.model");

const addAlbum = async (req, res) => {
  try {
    const { mda, mdaFullname, title, description, photos } = req.body;

    if (!mda || !title) {
      return res.status(400).json({ status: "bad", message: "mda and title are required" });
    }

    const album = await Gallery.create({
      mda,
      mdaFullname,
      title,
      description,
      photos: photos || [],
      coverImage: photos?.[0]?.url || "",
    });

    res.status(201).json({ status: "ok", message: "Album created successfully", data: album });
  } catch (error) {
    res.status(500).json({ status: "bad", message: error.message });
  }
};

const getAlbumsForMda = async (req, res) => {
  try {
    const { mda } = req.params;
    const albums = await Gallery.find({ mda }).sort({ createdAt: -1 });
    res.status(200).json({ status: "ok", message: "Fetched albums successfully", data: albums });
  } catch (error) {
    res.status(500).json({ status: "bad", message: error.message });
  }
};

const getSingleAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const album = await Gallery.findById(id);
    if (!album) return res.status(404).json({ status: "bad", message: "Album not found" });
    res.status(200).json({ status: "ok", message: "Fetched album successfully", data: album });
  } catch (error) {
    res.status(500).json({ status: "bad", message: error.message });
  }
};

const updateAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, photos } = req.body;

    const updateData = { title, description };
    if (photos) {
      updateData.photos = photos;
      updateData.coverImage = photos[0]?.url || "";
    }

    const album = await Gallery.findByIdAndUpdate(id, updateData, { new: true });
    if (!album) return res.status(404).json({ status: "bad", message: "Album not found" });
    res.status(200).json({ status: "ok", message: "Album updated successfully", data: album });
  } catch (error) {
    res.status(500).json({ status: "bad", message: error.message });
  }
};

const deleteAlbum = async (req, res) => {
  try {
    const { id } = req.params;
    const album = await Gallery.findByIdAndDelete(id);
    if (!album) return res.status(404).json({ status: "bad", message: "Album not found" });
    res.status(200).json({ status: "ok", message: "Album deleted successfully" });
  } catch (error) {
    res.status(500).json({ status: "bad", message: error.message });
  }
};

module.exports = { addAlbum, getAlbumsForMda, getSingleAlbum, updateAlbum, deleteAlbum };
