const assert = require("assert");
const { preloadWeb3 } = require("./helpers/preloadWeb3");

describe("Swarm", () => {
  const services = preloadWeb3();
  it.skip("should get swarm info (bzz_info)", async() => {
    const { web3 } = services;
    const result = await web3.bzz.getInfo();
    assert.isArray(result, "Stub returns empty array");
  });

  it.skip("should get swarm hive (bzz_hive)", async() => {
    const { web3 } = services;
    const result = await web3.bzz.getHive();
    assert.isArray(result, "Stub returns empty array");
  });
});
