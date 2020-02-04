import { assert } from "chai";
import "mocha";
const Index = require("../../src/index");

describe("index", () => {
  it("prepare is a function", () => {
    assert.instanceOf(Index.prepare, Function);
  });
  it("publish is a function", () => {
    assert.instanceOf(Index.publish, Function);
  });
  it("verifyConditions is a function", () => {
    assert.instanceOf(Index.verifyConditions, Function);
  });
});
