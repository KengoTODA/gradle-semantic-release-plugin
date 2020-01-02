import { existsSync } from "fs";
import { join } from "path";
import { parse, stringify } from "properties";
import { promisify } from "util";
import { IContext } from "./definition";
import { getVersion } from "./gradle";
const parseProperties = promisify(parse);
const writeProperties = promisify(stringify);

export async function updateVersion(
  cwd: string,
  version: string
): Promise<void> {
  const path = join(cwd, "gradle.properties");
  let prop = { version };
  if (existsSync(path)) {
    prop = (await parseProperties(path, { path: true })) as {
      version: string;
    };
    prop.version = version;
  }
  await writeProperties(prop, { path });
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
