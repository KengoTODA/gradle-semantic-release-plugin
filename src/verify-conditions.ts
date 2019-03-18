import {IContext} from "./definition";

module.exports = async function verifyConditions(pluginConfig: object, context: IContext) {
  const {logger} = context;
  logger.info(`Hello verifyConditions! Your config is:${JSON.stringify(pluginConfig)}`);
};
