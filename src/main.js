const express = require("express");
const express_queue = require("express-queue");
// import fetch from "node-fetch";
const fetch = require("node-fetch");
const app = express();
app.use(express.json());

app.use(express_queue({ activeLimit: 1, queuedLimit: -1 }));

app.post("/ingest", async (req, res) => {
  let body_elements = Object.keys(req.body);
  // exclude source_stac_api_url and target_stac_api_url from body elements and store them in variables
  let source_stac_api_url = body_elements.find(
    (element) => element === "source_stac_api_url"
  );
  // if source_stac_api_url is not found in body elements, return error
  if (!source_stac_api_url) {
    return res.status(400).send("source_stac_api_url not found in body");
  }
  let target_stac_api_url = body_elements.find(
    (element) => element === "target_stac_api_url"
  );
  // if target_stac_api_url is not found in body elements, return error
  if (!target_stac_api_url) {
    return res.status(400).send("target_stac_api_url not found in body");
  }
  body_elements = body_elements.filter(
    (element) =>
      element !== source_stac_api_url && element !== target_stac_api_url
  );
  let source_stac_api_url_value = req.body[source_stac_api_url];
  console.log("Source url is: " + source_stac_api_url_value);
  // if source_stac_api_url_value last element is slash, remove slash
  if (source_stac_api_url_value.slice(-1) === "/") {
    source_stac_api_url_value = source_stac_api_url_value.slice(0, -1);
  }
  let source_stac_api_search_url = source_stac_api_url_value + "/search";
  console.log("Elements for stac search are: ", body_elements);
  console.log("Source stac api search url is: ", source_stac_api_search_url);
  // create a get request to the source stac api url with the body elements as query parameters
  let url = `${source_stac_api_search_url}?${body_elements.map(
    (element) => `${element}=${req.body[element]}`
  )}&count=100`.replace(",", "&");
  console.log("Final search url is: " + url);
  try {
    let source_stac_api_response = await fetch(url);
    let response = await source_stac_api_response.json();
    res.status(source_stac_api_response.status).send(response);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

app.listen(9000, "0.0.0.0");
