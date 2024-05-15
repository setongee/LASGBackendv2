const express = require("express");
const app = express();
const mongoose = require("mongoose");
const { Mdas_Dataset } = require("./models/mda.model.js");
const MdaRoutes = require("./routes/Mda.routes.js");

app.use(express.json());
app.use(express.urlencoded( { extended : false } ) );

const base_url = '/api/v2'


app.use(`${base_url}/mdas`, MdaRoutes );


mongoose.connect('mongodb+srv://lasgadmindatabase:NyU4M00EzxfMRaFs@lasgv2db.z4d3eki.mongodb.net/LASG_API?retryWrites=true&w=majority&appName=lasgv2DB')
    .then(() => {
        console.log('Database is Connected!');
        app.listen(8000, () => {

            console.log("App is running on port 8000");

        });
    })
    .catch(() => {
        console.log("Database not Connected!");
    })