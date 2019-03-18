import {IContext} from "./definition";

module.exports = async function prepare(pluginConfig: object, context: IContext) {
  const {logger} = context;
  logger.info(`Hello prepare! Your config is:${JSON.stringify(pluginConfig)}`);
};
