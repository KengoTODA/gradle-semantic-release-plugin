import { existsSync } from "fs";
import { join } from "path";
import { parseFile, write } from "promisified-properties";
import { IContext } from "./definition";
import { getVersion } from "./gradle";

export async function updateVersion(
  cwd: string,
  version: string
): Promise<void> {
  const path = join(cwd, "gradle.properties");
  let prop = new Map<string, string>();
  if (existsSync(path)) {
    prop = await parseFile(path);
  }
  prop.set("version", version);
  return write(prop, path);
}

export default async function prepare(pluginConfig: object, context: IContext) {
  const { cwd, env, nextRelease } = context;
  await updateVersion(cwd, nextRelease.version);
  const version = await getVersion(cwd, env as NodeJS.ProcessEnv);
  if (version !== nextRelease.version) {
    throw new Error(
      `Failed to update version from ${version} to ${nextRelease.version}. ` +
        "Make sure that you define version not in build.gradle but in gradle.properties."
    );
  }
}
