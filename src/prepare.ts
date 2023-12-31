import { existsSync } from "fs";
import { join } from "path";
import { parseFile, write } from "promisified-properties";
import { IContext } from "./definition";
import { getVersion } from "./gradle";
import { Entry } from "promisified-properties/lib/types";

export async function updateVersion(
  cwd: string,
  version: string,
): Promise<void> {
  const path = join(cwd, "gradle.properties");
  if (existsSync(path)) {
    const prop = await parseFile(path);
    const index = prop.findIndex(
      (entry) => "key" in entry && entry.key == "version",
    );
    if (index < 0) {
      prop.push({ key: "version", value: version });
    } else {
      (prop[index] as Entry).value = version;
    }
    return write(prop, path);
  } else {
    return write([{ key: "version", value: version }], path);
  }
}

export default async function prepare(pluginConfig: object, context: IContext) {
  const { cwd, env, nextRelease } = context;
  await updateVersion(cwd, nextRelease.version);
  const version = await getVersion(cwd, env as NodeJS.ProcessEnv);
  if (version !== nextRelease.version) {
    throw new Error(
      `Failed to update version from ${version} to ${nextRelease.version}. ` +
        "Make sure that you define version not in build.gradle but in gradle.properties.",
    );
  }
}
