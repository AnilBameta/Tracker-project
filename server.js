require('dotenv').config();
const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const PORT = process.env.PORT || 3500;
const {logger} = require("./middleware/logger");
const { logEvents } = require("./middleware/logger");
const errorHandler = require("./middleware/errorhandler");
const corsOptions = require("./config/corsOptions");
const connectDB = require("./config/dbConn");

connectDB();

app.use("/", express.static(path.join(__dirname, "/public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use(cors(corsOptions));

app.use(logger);

app.use("/", require("./routes/root"));
app.use("/user", require('./routes/userRoutes'))

app.all(/.*/, (req, res, next) => {
  res.status(400);
  if (req.accepts("html")) {
    res.sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.json({ message: "404 Not found" });
  } else {
    res.type("txt").send("404 Not found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT, () => console.log(`Port running in ${PORT}`));
});

mongoose.connection.on("error", (err) => {
  console.log("Mongoose connection error:", err);

  try {
    const msg = `${err?.no || ''}: ${err?.code || ''}\t${err?.syscall || ''}\t${err?.hostname || ''}`;
    logEvents(msg, "mongoErrLog.log");
  } catch (e) {
    console.error("Logging failed:", e.message);
  }
});
