import { getTaskToPublish } from "./config";
import { IContext, PluginConfig } from "./definition";
import { getCommand } from "./gradle";

module.exports = async function verifyConditions(
  pluginConfig: PluginConfig,
  context: IContext,
) {
  const { cwd, env, logger } = context;
  const command = await getCommand(cwd);
  if (command !== "./gradlew") {
    throw new Error(`Gradle wrapper not found at ${cwd}`);
  }

  if (!pluginConfig.skipPublishing) {
    const task = await getTaskToPublish(
      pluginConfig,
      cwd,
      env as NodeJS.ProcessEnv,
      logger,
    );
    if (task.length === 0) {
      throw new Error("No task found that can publish artifacts");
    }
  }
  logger.debug("Verified conditions, and found no problem");
};
