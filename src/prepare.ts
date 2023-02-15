import { existsSync } from "fs";
import { join } from "path";
import { parseFile, write } from "promisified-properties";
import { IContext } from "./definition";
import { getVersion } from "./gradle";

const VERSION_PROPS = ["version", "VERSION_NAME"];

export async function updateVersion(
  cwd: string,
  version: string
): Promise<void> {
  const path = join(cwd, "gradle.properties");
  var foundProp = false;
  let props = new Map<string, string>();
  if (existsSync(path)) {
    props = await parseFile(path);
  }
  for (const prop of VERSION_PROPS) {
    if (props.has(prop)) {
      foundProp = true;
      props.set(prop, version);
    }
  }
  if (!foundProp) {
    props.set("version", version);
  }
  return write(props, path);
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
