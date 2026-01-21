import { constants, promises } from "fs";
import { join } from "path";
import { cwd } from "process";
import { sync as rmdir } from "rimraf";
import { Signale } from "signale";
import {
  autoDetectPublicationTask,
  buildOptions,
  getCommand,
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

  describe("autoDetectPublicationTask()", () => {
    it("returns empty array when there is no task to publish", async () => {
      const gradleProject = join(cwd(), "test/project/without-plugin");
      const task = await autoDetectPublicationTask(
        gradleProject,
        process.env,
        new Signale(),
      );
      expect(task).toEqual([]);
    });
    it("returns 'publish' when there is maven-publish-plugin", async () => {
      const gradleProject = join(
        cwd(),
        "test/project/with-maven-publish-plugin",
      );
      const task = await autoDetectPublicationTask(
        gradleProject,
        process.env,
        new Signale(),
      );
      expect(task).toEqual(["publish"]);
    });
    it.skip("returns 'uploadArchives' when there is available legacy publishing method", async () => {
      const gradleProject = join(cwd(), "test/project/with-legacy-publishing");
      const task = await autoDetectPublicationTask(
        gradleProject,
        process.env,
        new Signale(),
      );
      expect(task).toEqual(["uploadArchives"]);
    });
    it("returns 'artifactoryPublish' when there is available artifactory-plugin", async () => {
      const gradleProject = join(cwd(), "test/project/with-artifactory-plugin");
      const task = await autoDetectPublicationTask(
        gradleProject,
        process.env,
        new Signale(),
      );
      expect(task).toEqual(["artifactoryPublish"]);
    });
    it("returns 'publishPlugins' when there is available plugin-publish-plugin", async () => {
      const gradleProject = join(
        cwd(),
        "test/project/with-plugin-publish-plugin",
      );
      const task = await autoDetectPublicationTask(
        gradleProject,
        process.env,
        new Signale(),
      );
      expect(task).toEqual(["publishPlugins"]);
    });
    it("returns 'publishPlugins' when there is available plugin-publish-plugin and maven-publish", async () => {
      const gradleProject = join(
        cwd(),
        "test/project/with-plugin-publish-and-maven-publish",
      );
      const task = await autoDetectPublicationTask(
        gradleProject,
        process.env,
        new Signale(),
      );
      expect(task).toEqual(["publishPlugins"]);
    });
    it("returns 'publishToSonatype' when there is available gradle-nexus", async () => {
      const gradleProject = join(cwd(), "test/project/with-gradle-nexus");
      const task = await autoDetectPublicationTask(
        gradleProject,
        process.env,
        new Signale(),
      );
      expect(task).toEqual([
        "publishToSonatype",
        "closeAndReleaseSonatypeStagingRepository",
      ]);
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
      const task = ["publish"];
      await publishArtifact(gradleProject, task, process.env, new Signale());
      const file = join(
        gradleProject,
        "build/repo/com/example/project/1.0/project-1.0.jar",
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
