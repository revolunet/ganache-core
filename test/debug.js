// const Web3 = require("web3");
const assert = require("assert");
const { send } = require("./helpers/rpc");
// const Ganache = require(process.env.TEST_BUILD
// ? "../build/ganache.core." + process.env.TEST_BUILD + ".js"
// : "../index.js");
// const fs = require("fs");
// const path = require("path");
// const solc = require("solc");
const { setUp } = require("./helpers/pretestSetup");

// Thanks solc. At least this works!
// This removes solc's overzealous uncaughtException event handler.
process.removeAllListeners("uncaughtException");

describe.skip("Debug", function() {
  const mainContract = "DebugContract";
  const contractFilenames = [];
  const contractPath = "../contracts/debug/";
  const options = {};

  const services = setUp(mainContract, contractFilenames, options, contractPath);

  const gas = 3141592;
  var hashToTrace = null;
  let expectedValueBeforeTrace = "1234";
  /*
  var provider;
  var web3;
  var accounts;
  var DebugContract;
  var debugContract;
  var source = fs.readFileSync(path.join(__dirname, "DebugContract.sol"), "utf8");
  var expectedValueBeforeTrace = "1234";

  before("init web3", function() {
    const provider = Ganache.provider();
    web3 = new Web3(provider);
  });

  before("get accounts", function() {
    return web3.eth.getAccounts().then((accs) => {
      accounts = accs;
      console.log(accs);
    });
  });

  before("compile source", async function() {
    this.timeout(10000);
    const { accounts } = services;
    console.log(accounts);
    var result = solc.compile({ sources: { "DebugContract.sol": source } }, 1);

    var code = "0x" + result.contracts["DebugContract.sol:DebugContract"].bytecode;
    var abi = JSON.parse(result.contracts["DebugContract.sol:DebugContract"].interface);

    DebugContract = new web3.eth.Contract(abi);
    DebugContract._code = code;

    const instance = await DebugContract.deploy({ data: code });
    debugContract = await instance.send({ from: accounts[0], gas });

    // TODO: ugly workaround - not sure why this is necessary.
    if (!debugContract._requestManager.provider) {
      debugContract._requestManager.setProvider(web3.eth._provider);
    }
  });
  */

  before("set up transaction that should be traced", async function() {
    const { accounts, instance } = services;
    const debugValue = instance.methods.setValue(26);
    const { transactionHash } = await debugValue.send({ from: accounts[0], gas });
    const value = await instance.methods.value().call({ from: accounts[0], gas });
    assert.strictEqual(value, "26");
    // Set the hash to trace to the transaction we made, so we know preconditions
    // are set correctly.
    hashToTrace = transactionHash;
  });

  before("change state of contract to ensure trace doesn't overwrite data", async function() {
    const { accounts, instance } = services;
    await instance.methods.setValue(expectedValueBeforeTrace).send({ from: accounts[0], gas });
    const value = await instance.methods.value().call({ from: accounts[0], gas });
    assert.strictEqual(value, expectedValueBeforeTrace);
  });

  it("should trace a successful transaction without changing state", async function() {
    const { web3 } = services;
    // We want to trace the transaction that sets the value to 26
    const method = "debug_traceTransaction";
    const params = [hashToTrace, []];
    const { result } = await send(method, params, web3);
    const { structLogs } = result;

    // To at least assert SOMETHING, let's assert the last opcode
    assert(structLogs.length > 0);

    for (let opcode of structLogs) {
      if (opcode.stack.length > 0) {
        // check formatting of stack
        // formatting was broken when updating to ethereumjs-vm v2.3.3
        assert.strictEqual(opcode.stack[0].length, 64);
        assert.notStrictEqual(opcode.stack[0].substr(0, 2), "0x");
        break;
      }
    }

    const { op, gasCost, pc, storage } = structLogs[structLogs.length - 1];
    console.log(structLogs[structLogs.length - 1]);

    assert.strictEqual(op, "STOP");
    assert.strictEqual(gasCost, 1);
    assert.strictEqual(pc, 145);
    assert.strictEqual(
      storage["0000000000000000000000000000000000000000000000000000000000000000"],
      "000000000000000000000000000000000000000000000000000000000000001a"
    );
    assert.strictEqual(
      storage["0000000000000000000000000000000000000000000000000000000000000001"],
      "000000000000000000000000000000000000000000000000000000000000001f"
    );

    // await debugContract.methods.value().call({ from: accounts[0], gas });
  });
});
