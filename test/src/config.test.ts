import { join } from "path";
import { cwd } from "process";
import { Signale } from "signale";
import { getTaskToPublish } from "../../src/config";
import { describe, expect, it, jest } from "@jest/globals";

describe("Test for config handling", function () {
  jest.setTimeout(60000);
  describe("getTaskToPublish()", () => {
    it("returns 'jib' when custom task is set", async () => {
      const gradleProject = join(
        cwd(),
        "test/project/with-maven-publish-plugin",
      );
      const task = await getTaskToPublish(
        {
          publicationTask: "jib",
        },
        gradleProject,
        process.env,
        new Signale(),
      );
      expect(task).toEqual(["jib"]);
    });
    it("returns 'publish' when it should auto detect", async () => {
      const gradleProject = join(
        cwd(),
        "test/project/with-maven-publish-plugin",
      );
      const task = await getTaskToPublish(
        {},
        gradleProject,
        process.env,
        new Signale(),
      );
      expect(task).toEqual(["publish"]);
    });
  });
});
