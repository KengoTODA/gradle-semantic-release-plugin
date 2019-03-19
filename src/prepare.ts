import {join} from "path";
import {parse, stringify} from "properties";
import {promisify} from "util";
import {IContext} from "./definition";
const parseProperties = promisify(parse);
const writeProperties = promisify(stringify);

export async function updateVersion(cwd: string, version: string): Promise<void> {
  const path = join(cwd, "gradle.properties");
  const prop = await parseProperties(path, {path: true}) as {version: string};
  prop.version = version;
  await writeProperties(prop, {path});
}

export default async function prepare(pluginConfig: object, context: IContext) {
  const {cwd, nextRelease} = context;
  await updateVersion(cwd, nextRelease.version);
};
