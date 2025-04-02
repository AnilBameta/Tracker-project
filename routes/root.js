const express = require("express");
const path = require("path");
const router = express.Router();

router.get("/", (req, res) => {
  console.log("inside get");
  res.sendFile(path.join(__dirname, "..", "views", "index.html"));
});

module.exports = router;
