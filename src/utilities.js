/**
 * Addends the provider from the environment to the collection
 * @param {Object.<string, Object>} collection
 */
function addProviderToCollection(collection) {
  const SET_PROVIDER =
    process.env.STAC_API_SELECTIVE_INGESTER_PROVIDER_SET_HOST_PROVIDER || true;
  if (SET_PROVIDER) {
    collection.providers.push({
      name:
        process.env.STAC_API_SELECTIVE_INGESTER_PROVIDER_NAME ||
        "Sattelite Applications Catapult",
      url:
        process.env.STAC_API_SELECTIVE_INGESTER_PROVIDER_URL ||
        "https://sa.catapult.org.uk/",
      roles: ["host"],
    });
  }
}

/**
 * Removes the rels from the links in the collection.
 */
function removeRelsFromLinks(collection) {
  const refsToRemove = ["items", "parent", "root", "self", "collection"];
  collection.links = collection.links.filter(
    (link) => !refsToRemove.includes(link.rel)
  );
}

module.exports = {
  addProviderToCollection,
  removeRelsFromLinks,
};
