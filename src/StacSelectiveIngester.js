const collectionUtils = require("./utilities.js");
const axios = require("axios");
const { throws } = require("assert");

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
    this.newlyAddedItemsCount = 0;
    this.updatedItemsCount = 0;
    this.itemsAlreadyPresentCount = 0;
  }

  getNumUpdatedCollections() {
    return this.updatedCollectionsCount;
  }

  getUpdatedCollectionNames() {
    return this.updatedCollections;
  }

  getNumNewlyStoredCollections() {
    return this.newlyStoredCollectionsCount;
  }
  getNewlyStoredCollectionNames() {
    return this.newlyStoredCollections;
  }

  getNumNewlyAddedItems() {
    return this.newlyAddedItemsCount;
  }

  getNumUpdatedItems() {
    return this.updatedItemsCount;
  }

  getNumItemsAlreadyPresent() {
    return this.itemsAlreadyPresentCount;
  }

  async _reportProgressToEndpont() {
    const data = {
      id: this.callbackId,
      newlyStoredCollectionsCount: this.newlyStoredCollectionsCount,
      updatedCollectionsCount: this.updatedCollectionsCount,
      newlyAddedItemsCount: this.newlyAddedItemsCount,
      updatedItemsCount: this.updatedItemsCount,
      itemsAlreadyPresentCount: this.itemsAlreadyPresentCount,
    };
    console.info(data);
    if (this.callbackUrl && this.callbackId) {
      try {
        await axios.post(this.callbackUrl, data);
      } catch (error) {
        console.error(error);
      }
    }
  }
  async getAllItems() {
    let itemsUrl = this.startUrl;
    while (itemsUrl) {
      let response;
      response = await axios.get(itemsUrl);
      itemsUrl = undefined;
      const data = response.data;
      const feautures = data.features;
      let storeItemsPromises = [];
      for (let i = 0; i < feautures.length; i++) {
        const item = feautures[i];
        const sourceStacApiCollectionUrl = item.links.find(
          (link) => link.rel === "collection"
        ).href;
        await this._storeCollectionOnTargetStacApi(sourceStacApiCollectionUrl);
        let collectionId = sourceStacApiCollectionUrl.split("/").pop();
        collectionUtils.removeRelsFromLinks(item);
        storeItemsPromises.push(this._storeItemInBigStack(item, collectionId));
        if (i % 10 === 0) {
          await Promise.all(storeItemsPromises);
        }
      }

      await Promise.all(storeItemsPromises);
      console.log("Resolved all promises");

      const nextItemSetLink = data.links.find((link) => link.rel === "next");
      if (nextItemSetLink) {
        itemsUrl = nextItemSetLink.href;
        console.log("Getting next page...", itemsUrl);
      } else {
        console.log("Stopping at last page.");
        break;
      }
    }
    this._reportProgressToEndpont();
  }

  async _storeCollectionOnTargetStacApi(sourceStacApiCollectionUrl) {
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
        console.error(`Error storing collection ${collection.data.id}`, error);
      }
    }
    this.processedCollections.push(sourceStacApiCollectionUrl);
  }

  async _storeItemInBigStack(item, collectionId) {
    return new Promise(async (resolve, reject) => {
      console.log("Storing item: ", item.id);
      const itemsEndpoint =
        this.targetStacApiUrl + "/collections/" + collectionId + "/items";
      try {
        let response = await axios.post(itemsEndpoint, item);
        console.log("Stored item: ", response.data.id);
        this.newlyAddedItemsCount++;
        return resolve("Stored item: ", response.data.id);
      } catch (error) {
        if (error.response && error.response.data && error.response.data.code) {
          const message = error.response.data.code;
          if (message === "ConflictError") {
            if (this.update === false) {
              console.log(`Item ${item.id} already exists.`);
              this.itemsAlreadyPresentCount++;
              return resolve(`Item ${item.id} already exists.`);
            } else {
              try {
                let response = await axios.put(
                  itemsEndpoint + "/" + item.id,
                  item
                );
                this.updatedItemsCount++;
                console.log("Updated item: ", response.data.id);
                return resolve("Updated item: ", response.data.id);
              } catch (error) {
                console.error(`Error updating item ${item.id}`, error);
                return reject(error);
              }
            }
          } else {
            console.error(`Error storing item ${item.id}: ${error}`);
            return reject(error);
          }
        }
      }
    });
  }
}

module.exports = { StacSelectiveIngester };
