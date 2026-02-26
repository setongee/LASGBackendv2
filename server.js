const express = require("express");
const app = express();
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");
const { execSync } = require("child_process");
const port = 8083;

// Kill any existing Node process on this port (safe guard)
function freePort(port) {
  try {
    if (process.platform === "win32") {
      // Windows
      const output = execSync(`netstat -ano | findstr :${port}`).toString();
      const lines = output.trim().split("\n");
      lines.forEach((line) => {
        const parts = line.trim().split(/\s+/);
        const pid = parts[parts.length - 1];
        if (pid) {
          try {
            execSync(`taskkill /PID ${pid} /F`);
            console.log(`Killed process ${pid} on port ${port}`);
          } catch {}
        }
      });
    } else {
      // macOS/Linux
      const pid = execSync(`lsof -t -i :${port} -sTCP:LISTEN`)
        .toString()
        .trim();
      if (pid) {
        execSync(`kill -9 ${pid}`);
        console.log(`Killed process ${pid} on port ${port}`);
      }
    }
  } catch {
    // console.log("No process is running");
  }
}

freePort(port);

app.get("/", (req, res) => {
  res.send("Server is healthy 🚀");
});

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",
  "http://localhost:5177",
  "https://lagosstate.gov.ng",
  "https://3dlk7dwr-5174.uks1.devtunnels.ms/",
  "https://lasg-ai-p2.vercel.app",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));

// Routes imports
const MdaRoutes = require("./routes/Mda.routes.js");
const MdaDirectoryRoutes = require("./routes/MdaDirectory.routes.js");
const CategoryRoutes = require("./routes/service_category.routes.js");
const serviceRoutes = require("./routes/services.routes.js");
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
const mot = require("./routes/admin/mot.js");
const mda = require("./routes/admin/auth-mda.js");
const analytics = require("./routes/admin/analytics.routes.js");
const logger = require("./routes/logger.routes.js");
const webTemplateRequestRoutes = require("./routes/web-template-request.routes");
const createMDARoutes = require("./routes/admin/createMDA.routes.js");
const draftRoutes = require("./routes/draft.routes");

const base_url = "/api/v2";

// Api Routes
app.use(`${base_url}/mdas`, MdaRoutes);
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
app.use(`${base_url}/health`, moh);
app.use(`${base_url}/sto`, sto);
app.use(`${base_url}/mepb`, mepb);
app.use(`${base_url}/mot`, mot);
app.use(`${base_url}/mda`, mda);
app.use(`${base_url}/analytics`, analytics);
app.use(`${base_url}/logger`, logger);
app.use(`${base_url}/web-template-requests`, webTemplateRequestRoutes);
app.use(`${base_url}/create-mdas`, createMDARoutes);
app.use(`${base_url}/draft`, draftRoutes);

// DB connection
mongoose
  .connect(
    `mongodb+srv://lasgadmindatabase:${process.env.DB_PASSWORD}@lasgv2db.z4d3eki.mongodb.net/LASG_API?retryWrites=true&w=majority&appName=lasgv2DB`,
  )
  .then(() => {
    console.log("Database is Connected!");
    app.listen(port, () => {
      console.log(`🚀 App is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log("Database not Connected!");
    console.log(err.message);
  });
