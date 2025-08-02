import { getTaskToPublish } from "./config";
import { IContext, PluginConfig } from "./definition";
import { publishArtifact } from "./gradle";

export default async function publish(
  pluginConfig: PluginConfig,
  context: IContext,
) {
  const { cwd, env, logger } = context;

  if (pluginConfig.skipPublishing) {
    return;
  }

  const task = await getTaskToPublish(
    pluginConfig,
    cwd,
    env as NodeJS.ProcessEnv,
    logger,
  );
  await publishArtifact(cwd, task, env as NodeJS.ProcessEnv, logger);
}
