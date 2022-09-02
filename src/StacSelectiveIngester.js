const collectionUtils = require("./utilities.js");
const axios = require("axios");

class StacSelectiveIngester {
  constructor(
    sourceApiUrl,
    startUrl,
    targetStacApiUrl,
    update = false,
    callbackUrl = undefined,
    callbackId = undefined
  ) {
    // remove trailing slash if it exists on sourceApiUrl
    if (sourceApiUrl.endsWith("/")) {
      sourceApiUrl = sourceApiUrl.slice(0, -1);
    }
    this.sourceApiUrl = sourceApiUrl;
    this.startUrl = startUrl;
    this.targetStacApiUrl = targetStacApiUrl;
    // remove trailing slash if it exists on targetStacApiUrl
    if (targetStacApiUrl.endsWith("/")) {
      targetStacApiUrl = targetStacApiUrl.slice(0, -1);
    }
    this.update = update;
    this.callbackUrl = callbackUrl;
    this.callbackId = callbackId;
    this.processedCollections = [];
    this.newlyStoredCollectionsCount = 0;
    this.newlyStoredCollections = [];
    this.updatedCollectionsCount = 0;
    this.updatedCollections = [];
  }

  async getAllItems() {
    let itemsUrl = this.startUrl;
    while (itemsUrl) {
      let response;
      console.log(`Making request to ${itemsUrl}`);
      response = await axios.get(itemsUrl);
      const data = response.data;
      const feautures = data.features;
      for (let i = 0; i < feautures.length; i++) {
        const item = feautures[i];
        const sourceStacApiCollectionUrl = item.links.find(
          (link) => link.rel === "collection"
        ).href;
        await this.storeCollectionOnTargetStacApi(sourceStacApiCollectionUrl);
      }

      const nextCollectionLink = data.links.find((link) => link.rel === "next");
      if (nextCollectionLink) {
        itemsUrl = nextCollectionLink.href;
        console.log("Getting next page...", itemsUrl);
      } else {
        itemsUrl = undefined;
      }
    }
  }

  async storeCollectionOnTargetStacApi(sourceStacApiCollectionUrl) {
    if (this.processedCollections.includes(sourceStacApiCollectionUrl)) {
      return;
    }
    let collection;
    collection = await axios.get(sourceStacApiCollectionUrl);
    collectionUtils.addProviderToCollection(collection.data);
    collectionUtils.removeRelsFromLinks(collection.data);
    const collectionsEndpoint = this.targetStacApiUrl + "/collections";
    try {
      let response = await axios.post(collectionsEndpoint, collection.data);
      console.log("Stored collection: ", response.data.id);
      this.newlyStoredCollectionsCount++;
      this.newlyStoredCollections.push(sourceStacApiCollectionUrl);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.code) {
        const message = error.response.data.code;
        if (message === "ConflictError")
          console.log(`Collection ${collection.data.id} already exists.`);
        let response = await axios.put(collectionsEndpoint, collection.data);
        console.log("Updated collection: ", response.data.id);
        this.updatedCollectionsCount++;
        this.updatedCollections.push(sourceStacApiCollectionUrl);
      } else {
        console.log(`Error storing collection ${collection.data.id}`);
        console.error(error);
      }
    }
    this.processedCollections.push(sourceStacApiCollectionUrl);
  }
  /**
   * Stores the item in our big stack.
   *
   * Currently, this function just stores it into local list.
   * @param {Object.<string, Object>} item
   */
  async storeItemInBigStack(item, collectionId) {
    console.log("Storing item: ", item.id);
    const itemsEndpoint =
      process.env.BIG_STAC_API_ROOT + "/collections/" + collectionId + "/items";

    try {
      let response = await axios.post(itemsEndpoint, item);
      console.log("Stored item: ", response.data.id);
    } catch (error) {
      if (error.response && error.response.data && error.response.data.code) {
        const message = error.response.data.code;

        if (message === "ConflictError")
          console.log(`Item ${item.id} already exists.`);
      } else {
        console.log(`Error storing item ${item.id}: ${error}`);
      }
    }
  }
}

module.exports = { StacSelectiveIngester };
