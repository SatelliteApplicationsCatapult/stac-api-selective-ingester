const express = require("express");
const express_queue = require("express-queue");
const validateBbox = require("./validateBbox.js");

const app = express();
app.use(express.json());

app.use(express_queue({ activeLimit: 1, queuedLimit: -1 }));

app.post("/ingest", async (req, res) => {
  let bbox = req.body.bbox;
  if (bbox) {
    if (!validateBbox(bbox)) {
      res.status(400).send("Invalid bbox");
      return;
    }
  }
  res.status(200).send("OK");
});

app.listen(9000, "0.0.0.0");
