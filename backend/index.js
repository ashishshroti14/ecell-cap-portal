const express = require("express");
const compression = require("compression");
const bodyParser = require("body-parser");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const connection = require("./config/connection");

//Connecting Mongodb Database
mongoose.connect(connection["main_website"].url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
});
mongoose.connection.once("open", () => {
    console.log("MongoDB database connection established successfully");
});
mongoose.connection.on("error", (err) => {
    console.error(err);
    console.info("MongoDB connection error. Please make sure MongoDB is running.");
    process.exit();
});

//Requiring routes
const eventsRoutes = require("./routes/events");
const homeRoutes = require("./routes/home");
const data = require("./routes/data");
const eddPortal = require("./routes/eddPortal");

//Setting port
const PORT = 5000 || process.env.PORT;

// Parsing the request bodys
app.use(
    cors({
        credentials: true,
        origin: [
            /https?:\/\/localhost:\d{4}/,
            "https://ecell.iitm.ac.in",
            "https://e21-admin-dashboard.vercel.app",
        ],
    })
);
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }));

//Use Compression(gzip)
app.use(compression({ level: 9 }));

//Setting view engine
app.set("view engine", "ejs");
app.use(express.static("assets"));

//Setting Routes
app.use(homeRoutes);
app.use("/event", eventsRoutes);
app.use("/data", data);
app.use("/eddPortal", eddPortal);

//Starting the server
app.listen(PORT, () => {
    console.log(`You are listening to Port ${PORT}`);
});
