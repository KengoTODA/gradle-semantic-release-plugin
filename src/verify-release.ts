import {IContext} from "./definition";

module.exports = async function verifyRelease(pluginConfig: object, context: IContext) {
  const {logger} = context;
  logger.info(`Hello verifyRelease! Your config is:${JSON.stringify(pluginConfig)}`);
};
