const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded( { extended : false } ) );

const MdaRoutes = require("./routes/Mda.routes.js");
const MdaDirectoryRoutes = require("./routes/MdaDirectory.routes.js");

const base_url = '/api/v2'

//Api Routes Function
app.use(`${base_url}/mdas`, MdaRoutes );
app.use(`${base_url}/directory`, MdaDirectoryRoutes );


mongoose.connect(`mongodb+srv://lasgadmindatabase:${process.env.DB_PASSWORD}@lasgv2db.z4d3eki.mongodb.net/LASG_API?retryWrites=true&w=majority&appName=lasgv2DB`)
    .then(() => {
        console.log('Database is Connected!');
        app.listen(8000, () => {

            console.log("App is running on port 8000");

        });
    })
    .catch(() => {
        console.log("Database not Connected!");
    })