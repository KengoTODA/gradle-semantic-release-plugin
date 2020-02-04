import { constants, promises } from "fs";
import { join } from "path";
import { cwd } from "process";
import { sync as rmdir } from "rimraf";
import { Signale } from "signale";
import { expect } from "chai";
import "mocha";
import {
  buildOptions,
  getCommand,
  getTaskToPublish,
  getVersion,
  publishArtifact
} from "../../src/gradle";

describe("Test for gradle handling", function() {
  this.timeout(60000);
  it("getCommand() return 'gradle' when there is no gradle wrapper", async () => {
    const command = await getCommand(cwd());
    expect(command).to.equal("gradle");
  });
  it("getCommand() can find the wrapper script", async () => {
    const gradleProject = join(cwd(), "test/project/without-plugin");
    const command = await getCommand(gradleProject);
    expect(command).to.equal("./gradlew");
  });

  it("getTaskToPublish() return empty string when there is no task to publish", async () => {
    const gradleProject = join(cwd(), "test/project/without-plugin");
    const task = await getTaskToPublish(
      gradleProject,
      process.env,
      new Signale()
    );
    expect(task).to.equal("");
  });
  it("getTaskToPublish() return 'publish' when there is maven-publish-plugin", async () => {
    const gradleProject = join(cwd(), "test/project/with-maven-publish-plugin");
    const task = await getTaskToPublish(
      gradleProject,
      process.env,
      new Signale()
    );
    expect(task).to.equal("publish");
  });
  it("getTaskToPublish() return 'uploadArchives' when there is available legacy publishing method", async () => {
    const gradleProject = join(cwd(), "test/project/with-legacy-publishing");
    const task = await getTaskToPublish(
      gradleProject,
      process.env,
      new Signale()
    );
    expect(task).to.equal("uploadArchives");
  });
  it("getTaskToPublish() return 'artifactoryDeploy' when there is available artifactory-plugin", async () => {
    const gradleProject = join(cwd(), "test/project/with-artifactory-plugin");
    const task = await getTaskToPublish(
      gradleProject,
      process.env,
      new Signale()
    );
    expect(task).to.equal("artifactoryDeploy");
  });
  it("getTaskToPublish() return 'publishPlugins' when there is available plugin-publish-plugin", async () => {
    const gradleProject = join(
      cwd(),
      "test/project/with-plugin-publish-plugin"
    );
    const task = await getTaskToPublish(
      gradleProject,
      process.env,
      new Signale()
    );
    expect(task).to.equal("publishPlugins");
  });

  it("getVersion() returns version defined in build.gradle", async () => {
    const gradleProject = join(cwd(), "test/project/without-properties-file");
    const version = await getVersion(gradleProject, process.env);
    expect(version).to.equal("1.2.3");
  });
  it("getVersion() returns version defined in gradle.properties", async () => {
    const gradleProject = join(cwd(), "test/project/with-properties-file");
    const version = await getVersion(gradleProject, process.env);
    expect(version).to.equal("0.1.2");
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
      expect(result).to.have.length(0);
    });
    it("adds project properties when specific there is envvar", () => {
      const env = process.env;
      env["GRADLE_PUBLISH_KEY"] = "my-key";
      env["GRADLE_PUBLISH_SECRET"] = "my-secret";
      const result = buildOptions(env);
      expect(result).to.include("-Pgradle.publish.key=my-key");
      expect(result).to.include("-Pgradle.publish.secret=my-secret");
    });
  });
});
