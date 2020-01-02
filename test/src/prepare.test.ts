import { existsSync, unlinkSync } from "fs";
import { join } from "path";
import { cwd } from "process";
import { parse, stringify } from "properties";
import { promisify } from "util";
import { updateVersion } from "../../src/prepare";
const parseProperties = promisify(parse);
const writeProperties = promisify(stringify);

describe("Test for prepare step", () => {
  afterEach(async () => {
    const gradleProject = join(cwd(), "test/project/with-properties-file");
    const path = join(gradleProject, "gradle.properties");
    await writeProperties({ version: "0.1.2" }, { path });
  });
  test("updateVersion() will update version in gradle.properties", async () => {
    expect.assertions(1);
    const gradleProject = join(cwd(), "test/project/with-properties-file");
    await updateVersion(gradleProject, "2.3.4");
    const path = join(gradleProject, "gradle.properties");
    const updated = (await parseProperties(path, { path: true })) as {
      version: string;
    };
    expect(updated.version).toBe("2.3.4");
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
  test("updateVersion() will create gradle.properties with specified version", async () => {
    expect.assertions(1);
    const gradleProject = join(cwd(), "test/project/without-properties-file");
    await updateVersion(gradleProject, "2.3.4");
    const path = join(gradleProject, "gradle.properties");
    const updated = (await parseProperties(path, { path: true })) as {
      version: string;
    };
    expect(updated.version).toBe("2.3.4");
  });
});
