var assert = require("assert");
const { preloadWeb3 } = require("./helpers/preloadWeb3");

describe("Ethereum", () => {
  let services = preloadWeb3();

  it.only("should get ethereum version (eth_protocolVersion)", async() => {
    const { web3 } = await services;

    const result = await web3.eth.getProtocolVersion();
    assert.strictEqual(result, "63", "Network Version should be 63");
  });
});
