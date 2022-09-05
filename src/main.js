const express = require("express");
const express_queue = require("express-queue");
// import fetch from "node-fetch";
const ingester = require("./StacSelectiveIngester.js");
const app = express();
app.use(express.json());

app.use(express_queue({ activeLimit: 1, queuedLimit: -1 }));

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

  // let url = `${sourceStacApiUrl}/search?${Object.keys(body).map(
  //   (element) => `${element}=${req.body[element]}`
  // )}&limit=1000`.replace(",", "&");
  let url = `${sourceStacApiUrl}/search?limit=1000&`;
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
    await stacSelectiveIngester.getAllItems();
    // let response = {
    //   num_updated_collections:
    //     stacSelectiveIngester.get_num_updated_collections(),
    //   num_newly_stored_collections:
    //     stacSelectiveIngester.get_num_newly_stored_collections(),
    //   newly_stored_collections:
    //     stacSelectiveIngester.get_newly_stored_collections(),
    //   updated_collections: stacSelectiveIngester.get_updated_collections(),
    // };
    return res.status(200).send("Accepted");
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.listen(9001, "0.0.0.0");
