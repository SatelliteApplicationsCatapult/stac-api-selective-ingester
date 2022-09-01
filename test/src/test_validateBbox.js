const assert = require("assert");
const validateBbox = require("../../src/validateBbox.js");

describe("validateBbox", function () {
  it("should return true for valid bbox", function () {
    assert.equal(validateBbox([-180, -90, 180, 90]), true);
    assert.equal(validateBbox([-180, -90, 180, 90]), true);
    assert.equal(validateBbox([-180, -90, -1000, 180, 90, 1000]), true);
    assert.equal(validateBbox([0, 0, 500, 0, 0, -182]), true);
    assert.equal(validateBbox([0, 0, 0, 0, 0, 181]), true);
  }),
    it("should return false for invalid bbox - too many members", function () {
      assert.equal(validateBbox([]), false);
      assert.equal(validateBbox([-180, -90, 180, 90, 0, 0, 0]), false);
      assert.equal(validateBbox([-180, -90, 180, 90, 0, 0, 0, 0]), false);
      assert.equal(validateBbox([-180, -90, 180, 90, 0, 0, 0, 0, 0]), false);
      assert.equal(validateBbox([-180, -90, 180, 90, 0, 0, 0, 0, 0, 0]), false);
    });
  it("should return false for invalid bbox, members not in -180 to 180 range", function () {
    assert.equal(validateBbox([-181, 0, 0, 0]), false);
    assert.equal(validateBbox([0, -181, 0, 0]), false);
    assert.equal(validateBbox([0, 0, -181, 0]), false);
    assert.equal(validateBbox([0, 0, 0, -181]), false);
    assert.equal(validateBbox([181, 0, 0, 0]), false);
    assert.equal(validateBbox([0, 181, 0, 0]), false);
    assert.equal(validateBbox([0, 0, 181, 0]), false);
    assert.equal(validateBbox([0, 0, 0, 181]), false);
    assert.equal(validateBbox([0, 0, 0, 0, 181, 0]), false);
  });
});
