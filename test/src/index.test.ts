const Index = require("../../src/index");

describe("index", () => {
  it("prepare is a function", () => {
    expect(Index.prepare).toBeInstanceOf(Function);
  });
  it("publish is a function", () => {
    expect(Index.publish).toBeInstanceOf(Function);
  });
  it("verifyConditions is a function", () => {
    expect(Index.verifyConditions).toBeInstanceOf(Function);
  });
});
