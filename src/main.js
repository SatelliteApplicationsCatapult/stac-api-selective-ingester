const express = require("express");
const express_queue = require("express-queue");
const ingester = require("./StacSelectiveIngester.js");
const app = express();
const fs = require("fs");
app.use(express.json());
app.use(express_queue({ activeLimit: 1, queuedLimit: -1 }));

// declare a js queue
let _executionQueue = [];

app.post("/ingest", async (req, res) => {
  let body = req.body;
  let sourceStacApiUrl = body.source_stac_api_url;
  if (!sourceStacApiUrl) {
    return res.status(400).send("source_stac_api_url not found in body");
  }
  // if sourceStacApiUrl ends with a slash, remove it
  if (sourceStacApiUrl.endsWith("/")) {
    sourceStacApiUrl = sourceStacApiUrl.slice(0, -1);
  }

  delete body.source_stac_api_url;
  console.log("Source stac api url: ", sourceStacApiUrl);
  let targetStacApiUrl = body.target_stac_api_url;
  if (!targetStacApiUrl) {
    return res.status(400).send("target_stac_api_url not found in body");
  }
  delete body.target_stac_api_url;
  console.log("Target stac api url: ", targetStacApiUrl);
  // if targetStacApiUrl ends with a slash, remove it
  if (targetStacApiUrl.endsWith("/")) {
    targetStacApiUrl = targetStacApiUrl.slice(0, -1);
  }
  let update = body.update;
  if (!update) {
    update = false;
  }
  delete body.update;
  console.log("Update flag: ", update);
  let callbackEndpoint = body.callbackEndpoint;
  delete body.callbackEndpoint;
  console.log("Callback endpoint: ", callbackEndpoint);
  let callbackId = body.callbackId;
  delete body.callbackId;
  console.log("Callback id: ", callbackId);

  let url = `${sourceStacApiUrl}/search?limit=100&`;
  for (let key in body) {
    //console.log("key: ", key);
    let value = body[key];
    if (key === "bbox" || key === "collections" || key === "ids") {
      // convert value list to string delimited by commas
      value = value.join(",");
      url += `${key}=${value}&`;
    } else {
      url += `${key}=${value}&`;
    }
  }
  console.log("Final search url is: " + url);
  let stacSelectiveIngester = new ingester.StacSelectiveIngester(
    sourceStacApiUrl,
    url,
    targetStacApiUrl,
    update,
    callbackEndpoint,
    callbackId
  );
  try {
    _executionQueue.push(stacSelectiveIngester);
    let executionQueueLength = _executionQueue.length;
    let operationsPendingBeforeThisOne = executionQueueLength - 1;
    return res
      .status(200)
      .send(
        "Accepted, number of operations in queue before this one: " +
          operationsPendingBeforeThisOne
      );
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

function isDocker() {
  return fs.existsSync("/.dockerenv");
}

if (isDocker()) {
  app.listen(80, "0.0.0.0");
  console.log("Listening on port 80");
  // TODO: For some reason this does not work on azure ACI
} else {
  app.listen(80, "0.0.0.0");
  console.log("Listening on port 80");
}
async function run() {
  while (true) {
    if (_executionQueue.length > 0) {
      /** @type {StacSelectiveIngester}*/
      let execution = _executionQueue.shift();
      await execution.getAllItems();
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
}
run();
