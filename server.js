const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const PORT = process.env.PORT || 3500;
const logger = require("./middleware/logger");
const errorHandler = require("./middleware/errorhandler");
const corsOptions = require("./config/corsOptions");

app.use("/", express.static(path.join(__dirname, "/public")));

app.use(cookieParser);

app.use(cors(corsOptions));

app.use(logger);

app.use("/", require("./routes/root"));

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

app.listen(PORT, () => console.log(`Port running in ${PORT}`));
