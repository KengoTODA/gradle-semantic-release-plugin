import { describe, expect, it, jest } from "@jest/globals";
import * as gradle from "../../src/gradle";
import * as publish from "../../src/publish";

describe("publish()", () => {
  const publishSpy = jest.spyOn(gradle, "publishArtifact");
  it("will skip publication if configured", () => {
    publish.default(
      {
        skipPublishing: true,
      },
      {} as any,
    );
    expect(publishSpy).not.toBeCalled();
  });
});
