const express = require("express");

const { addNews, getAllNews, getSingleNews, getNewsForMda, updateNews, deleteNews } = require("../controllers/news.controller");
const router = express.Router();

router.post('/add', addNews);

router.get('/get/all', getAllNews);
router.get('/view/:id', getSingleNews);
router.get('/get/all/:mda', getNewsForMda)

router.put('/update/:id', updateNews)
router.delete('/delete/:id', deleteNews)

module.exports = router;