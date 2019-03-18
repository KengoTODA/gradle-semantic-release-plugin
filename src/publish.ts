import {IContext} from "./definition";

module.exports = async function publish(pluginConfig: object, context: IContext) {
  const {logger} = context;
  logger.info(`Hello publish! Your config is:${JSON.stringify(pluginConfig)}`);
};
