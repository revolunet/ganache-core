const assert = require("assert");
const preloadWeb3 = require("../helpers/web3/preloadWeb3");

describe("Whisper", () => {
  const services = preloadWeb3();
  it("should call get whisper version (shh_version)", async() => {
    const { web3 } = services;
    const result = await web3.shh.getVersion();
    assert.strictEqual(result, "2", "Whisper version should be 2");
  });
});
