import { constants, promises } from "fs";
import { join } from "path";
import { cwd } from "process";
import { sync as rmdir } from "rimraf";
import { Signale } from "signale";
import {
  buildOptions,
  getCommand,
  getTaskToPublish,
  getVersion,
  publishArtifact,
} from "../../src/gradle";
import { beforeEach, describe, expect, it, jest } from "@jest/globals";

describe("Test for gradle handling", function () {
  jest.setTimeout(60000);
  describe("getCommand()", () => {
    it("returns 'gradle' when there is no gradle wrapper", async () => {
      const command = await getCommand(cwd());
      expect(command).toBe("gradle");
    });
    it("finds the wrapper script", async () => {
      const gradleProject = join(cwd(), "test/project/without-plugin");
      const command = await getCommand(gradleProject);
      expect(command).toBe("./gradlew");
    });
  });

  describe("getTaskToPublish()", () => {
    it("returns empty string when there is no task to publish", async () => {
      const gradleProject = join(cwd(), "test/project/without-plugin");
      const task = await getTaskToPublish(
        gradleProject,
        process.env,
        new Signale()
      );
      expect(task).toBe("");
    });
    it("returns 'publish' when there is maven-publish-plugin", async () => {
      const gradleProject = join(
        cwd(),
        "test/project/with-maven-publish-plugin"
      );
      const task = await getTaskToPublish(
        gradleProject,
        process.env,
        new Signale()
      );
      expect(task).toBe("publish");
    });
    it("returns 'uploadArchives' when there is available legacy publishing method", async () => {
      const gradleProject = join(cwd(), "test/project/with-legacy-publishing");
      const task = await getTaskToPublish(
        gradleProject,
        process.env,
        new Signale()
      );
      expect(task).toBe("uploadArchives");
    });
    it("returns 'artifactoryDeploy' when there is available artifactory-plugin", async () => {
      const gradleProject = join(cwd(), "test/project/with-artifactory-plugin");
      const task = await getTaskToPublish(
        gradleProject,
        process.env,
        new Signale()
      );
      expect(task).toBe("artifactoryDeploy");
    });
    it("returns 'publishPlugins' when there is available plugin-publish-plugin", async () => {
      const gradleProject = join(
        cwd(),
        "test/project/with-plugin-publish-plugin"
      );
      const task = await getTaskToPublish(
        gradleProject,
        process.env,
        new Signale()
      );
      expect(task).toBe("publishPlugins");
    });
    it("returns 'publishPlugins' when there is available plugin-publish-plugin and maven-publish", async () => {
      const gradleProject = join(
        cwd(),
        "test/project/with-plugin-publish-and-maven-publish"
      );
      const task = await getTaskToPublish(
        gradleProject,
        process.env,
        new Signale()
      );
      expect(task).toBe("publishPlugins");
    });
  });

  describe("getVersion()", () => {
    it("returns version defined in build.gradle", async () => {
      const gradleProject = join(cwd(), "test/project/without-properties-file");
      const version = await getVersion(gradleProject, process.env);
      expect(version).toBe("1.2.3");
    });
    it("returns version defined in gradle.properties", async () => {
      const gradleProject = join(cwd(), "test/project/with-properties-file");
      const version = await getVersion(gradleProject, process.env);
      expect(version).toBe("0.1.2");
    });
  });

  describe("publishArtifact()", () => {
    beforeEach(() => {
      rmdir(join(cwd(), "test/project/with-publish/build"));
    });

    it("runs 'publish' task", async () => {
      const gradleProject = join(cwd(), "test/project/with-publish");
      await publishArtifact(gradleProject, process.env, new Signale());
      const file = join(
        gradleProject,
        "build/repo/com/example/project/1.0/project-1.0.jar"
      );
      await promises.access(file, constants.F_OK);
    });
  });
  describe("buildOptions()", () => {
    it("returns an empty array", () => {
      const result = buildOptions({});
      expect(result).toHaveLength(0);
    });
    it("adds project properties when specific there is envvar", () => {
      const env = process.env;
      env["GRADLE_PUBLISH_KEY"] = "my-key";
      env["GRADLE_PUBLISH_SECRET"] = "my-secret";
      const result = buildOptions(env);
      expect(result).toContain("-Pgradle.publish.key=my-key");
      expect(result).toContain("-Pgradle.publish.secret=my-secret");
    });
  });
});
