const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require('cors');
const port = 8000

app.use(cors());
app.use(express.json({limit : '50mb'}));
app.use(express.urlencoded({extended : false, limit: '50mb'}));

const MdaRoutes = require("./routes/Mda.routes.js");
const MdaDirectoryRoutes = require("./routes/MdaDirectory.routes.js");
const CategoryRoutes = require("./routes/service_category.routes.js");
const serviceRoutes = require("./routes/services.routes.js")
const NewsRoutes = require("./routes/news.routes.js");
const ExecutivesRoutes = require("./routes/executives.routes.js");
const Subscibers = require("./routes/subscribers.js");
const userRoutes = require("./routes/user.routes.js");
const adminRoutes = require("./routes/authAdmin.routes");
const eventRoutes = require("./routes/events.routes.js");

// MDA Admin Routes
const mist = require("./routes/admin/mist.routes.js");
const mof = require("./routes/admin/mof.js");
const moh = require("./routes/admin/moh.js");
const sto = require("./routes/admin/sto.js");
const mepb = require("./routes/admin/mepb.js");

const base_url = '/api/v2'

//Api Routes Function
app.use(`${base_url}/mdas`, MdaRoutes );
app.use(`${base_url}/directory`, MdaDirectoryRoutes);
app.use(`${base_url}/category`, CategoryRoutes);
app.use(`${base_url}/services`, serviceRoutes);
app.use(`${base_url}/news`, NewsRoutes);
app.use(`${base_url}/executives`, ExecutivesRoutes);
app.use(`${base_url}/subscribers`, Subscibers);
app.use(`${base_url}/user`, userRoutes);
app.use(`${base_url}/admin`, adminRoutes);
app.use(`${base_url}/events`, eventRoutes);
app.use(`${base_url}/mist`, mist);
app.use(`${base_url}/mof`, mof);
app.use(`${base_url}/moh`, moh);
app.use(`${base_url}/sto`, sto);
app.use(`${base_url}/mepb`, mepb);


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