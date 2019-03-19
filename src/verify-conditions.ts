import {IContext} from "./definition";
import {getCommand, getTaskToPublish} from "./gradle";

module.exports = async function verifyConditions(pluginConfig: object, context: IContext) {
  const {cwd, env, logger} = context;
  const command = await getCommand(cwd);
  if (command !== "./gradlew") {
    throw new Error(`Gradle wrapper not found at ${cwd}`);
  }
  const task = await getTaskToPublish(cwd, env as NodeJS.ProcessEnv);
  if (task === "") {
    throw new Error("No task found that can publish artifacts");
  }
  // TODO confirm that version is not defined in build.gradle and other places. `gradle properties -q` will print effective version.
  logger.debug("Verified conditions, and found no problem");
};
