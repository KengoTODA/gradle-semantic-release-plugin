import { IContext } from "./definition";
import { publishArtifact } from "./gradle";

module.exports = async function publish(
  pluginConfig: object,
  context: IContext
) {
  const { cwd, env, logger } = context;
  await publishArtifact(cwd, env as NodeJS.ProcessEnv, logger);
};
