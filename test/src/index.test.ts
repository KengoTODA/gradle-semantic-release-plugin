const Index = require("../../src/index");

describe("index", () => {
  test("prepare is a function", () => {
    expect(Index.prepare).toBeInstanceOf(Function);
  });
  test("publish is a function", () => {
    expect(Index.publish).toBeInstanceOf(Function);
  });
  test("verifyConditions is a function", () => {
    expect(Index.verifyConditions).toBeInstanceOf(Function);
  });
});
