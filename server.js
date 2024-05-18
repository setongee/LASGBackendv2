const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require('cors');
const port = 8000

app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({extended : false, limit: '50mb'}));

const MdaRoutes = require("./routes/Mda.routes.js");
const MdaDirectoryRoutes = require("./routes/MdaDirectory.routes.js");
const UploaderMiddleware = require("./middleware/uploader.js");
const CategoryRoutes = require("./routes/service_category.routes.js")

const base_url = '/api/v2'

//Api Routes Function
app.use(`${base_url}/mdas`, MdaRoutes );
app.use(`${base_url}/directory`, MdaDirectoryRoutes );
app.use(`${base_url}/category`, CategoryRoutes );


//Uploader Middleware
app.post(`${base_url}/upload`, async (req, res) => {

    await UploaderMiddleware(req.body).then((msg) => res.send(msg));

})



// Connection to the DB

mongoose.connect(`mongodb+srv://lasgadmindatabase:${process.env.DB_PASSWORD}@lasgv2db.z4d3eki.mongodb.net/LASG_API?retryWrites=true&w=majority&appName=lasgv2DB`)
    .then(() => {
        console.log('Database is Connected!');
        app.listen(port, () => {

            console.log(`App is running on port ${port}`);

        });
    })
    .catch((err) => {
        console.log("Database not Connected!");
        console.log(err.message);
    })