import { existsSync, unlinkSync } from "fs";
import { join } from "path";
import { cwd } from "process";
import { updateVersion } from "../../src/prepare";
import { parseFile, write } from "promisified-properties";
import { afterEach, beforeEach, describe, expect, it } from "@jest/globals";
import { Comment, Entry } from "promisified-properties/lib/types";

describe("Test for prepare step", () => {
  afterEach(async () => {
    const gradleProject = join(cwd(), "test/project/with-properties-file");
    const path = join(gradleProject, "gradle.properties");
    return write(
      [
        {
          text: "# version will be bumped by gradle-semantic-release-plugin automatically",
        },
        { key: "version", value: "0.1.2" },
      ],
      path,
    );
  });
  it("updateVersion() will update version in gradle.properties", async () => {
    const gradleProject = join(cwd(), "test/project/with-properties-file");
    await updateVersion(gradleProject, "2.3.4");
    const path = join(gradleProject, "gradle.properties");
    return parseFile(path).then((updated) => {
      expect(updated).toHaveLength(2);
      expect((updated[0] as Comment).text).toBe(
        "# version will be bumped by gradle-semantic-release-plugin automatically",
      );
      expect((updated[1] as Entry).key).toBe("version");
      expect((updated[1] as Entry).value).toBe("2.3.4");
    });
  });
});

describe("Test for prepare step without gradle.properties", () => {
  beforeEach(async () => {
    const gradleProject = join(cwd(), "test/project/without-properties-file");
    const path = join(gradleProject, "gradle.properties");
    if (existsSync(path)) {
      unlinkSync(path);
    }
  });
  it("updateVersion() will create gradle.properties with specified version", async () => {
    const gradleProject = join(cwd(), "test/project/without-properties-file");
    await updateVersion(gradleProject, "2.3.4");
    const path = join(gradleProject, "gradle.properties");
    return parseFile(path).then((updated) => {
      expect((updated[0] as Entry).key).toBe("version");
      expect((updated[0] as Entry).value).toBe("2.3.4");
    });
  });
});
