const assert = require("assert");
const bootstrap = require("../helpers/contract/bootstrap");

// Thanks solc. At least this works!
// This removes solc's overzealous uncaughtException event handler.
process.removeAllListeners("uncaughtException");

describe("revert opcode", () => {
  const logger = {
    log: (message) => {}
  };

  const mainContract = "Revert";
  const contractFilenames = [];
  const contractPath = "../../contracts/revert/";
  const options = {
    logger,
    seed: "1337"
  };

  const services = bootstrap(mainContract, contractFilenames, options, contractPath);

  it("should return a transaction receipt with status 0 on REVERT", async() => {
    const { accounts, instance, web3 } = services;

    try {
      await instance.methods.alwaysReverts(5).send({ from: accounts[0] });
    } catch (error) {
      assert.strictEqual(error.results[error.hashes[0]].error, "revert", "Expected error result not returned.");
      const { status } = await web3.eth.getTransactionReceipt(error.hashes[0]);
      assert.strictEqual(status, false, "Reverted (failed) transactions should have a status of FALSE.");
    }
  });
});
