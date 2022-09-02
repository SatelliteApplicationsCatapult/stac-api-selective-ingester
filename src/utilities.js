/**
 * Addends the provider from the environment to the collection
 * @param {Object.<string, Object>} collection
 */
function addProviderToCollection(collection) {
  collection.providers.push({
    name: process.env.PROVIDER_NAME || "Sattelite Applications Catapult",
    url:
      process.env.PROVIDER_URL ||
      "https://www.satteliteapplicationscatapult.com",
    roles: ["host"],
  });
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
