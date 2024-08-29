import { Signale } from "signale";
import { PluginConfig } from "./definition";
import { autoDetectPublicationTask } from "./gradle";

export async function getTaskToPublish(
  pluginConfig: PluginConfig,
  cwd: string,
  env: NodeJS.ProcessEnv,
  logger: Signale,
) {
  const customTask = pluginConfig.publicationTask;
  if (customTask) {
    return [customTask];
  }

  return autoDetectPublicationTask(cwd, env, logger);
}
