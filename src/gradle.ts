import { spawn } from "child_process";
import { access, constants } from "fs";
import { join } from "path";
import { Signale } from "signale";
import split = require("split2");

const INFO_ARTIFACTORY = `Two publishing plugins have found: Gradle Artifactory and Maven Publish.
Gradle Artifactory is used for release.`;
const INFO_PUBLISH_PLUGINS = `Two publishing plugins have found: Java Gradle Plugin and Maven Publish.
Java Gradle Plugin is used for release.`;
const ERROR_MULTIPLE_PLUGIN = "Found multiple tasks to publish";

/**
 * @param {string} cwd the path of current working directory
 * @return A promise that resolves name of command to trigger Gradle
 */
export function getCommand(cwd: string): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    access(join(cwd, "gradlew"), constants.F_OK, (err) => {
      if (err) {
        if (err.code === "ENOENT") {
          resolve("gradle");
        } else {
          reject(err);
        }
      } else {
        resolve("./gradlew");
      }
    });
  });
}

/**
 * @param {string} cwd the path of current working directory
 * @return A promise that resolves name of task to publish artifact
 */
export function getTaskToPublish(
  cwd: string,
  env: NodeJS.ProcessEnv,
  logger: Signale
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const command = await getCommand(cwd);
    const child = spawn(command, ["tasks", "-q"], {
      cwd,
      env,
      stdio: ["inherit", "pipe"],
    });
    if (child.stdout === null) {
      reject(new Error("Unexpected error: stdout of subprocess is null"));
    } else {
      let task = "";
      child.stdout.pipe(split()).on("data", (line: string) => {
        if (line.startsWith("artifactoryDeploy -")) {
          // Plugins Gradle Artifactory Plugin and Maven Publish Plugin are often used together
          if (task !== "" && task !== "publish") {
            reject(new Error(ERROR_MULTIPLE_PLUGIN));
          }
          if (task === "publish") {
            logger.info(INFO_ARTIFACTORY);
          }
          task = "artifactoryDeploy";
        } else if (line.startsWith("publish -")) {
          // Plugins Gradle Artifactory Plugin and Maven Publish Plugin are often used together
          if (task !== "" && task !== "artifactoryDeploy" && task !== "publishPlugins") {
            reject(new Error(ERROR_MULTIPLE_PLUGIN));
          }
          if (task === "artifactoryDeploy") {
            logger.info(INFO_ARTIFACTORY);
          } else if (task === "publishPlugins") {
            logger.info(INFO_PUBLISH_PLUGINS);
          } else {
            task = "publish";
          }
        } else if (line.startsWith("uploadArchives -")) {
          if (task !== "") {
            reject(new Error(ERROR_MULTIPLE_PLUGIN));
          }
          task = "uploadArchives";
        } else if (line.startsWith("publishPlugins -")) {
          if (task === "publish") {
            logger.info(INFO_PUBLISH_PLUGINS);
          } else if (task !== "") {
            reject(new Error(ERROR_MULTIPLE_PLUGIN));
          }
          task = "publishPlugins";
        }
        logger.debug(line.toString());
      });
      child.stderr.pipe(split()).on("data", (line: string) => {
          logger.error(line.toString())
      });
      child.on("close", (code: number) => {
        if (code !== 0) {
          reject(
            new Error(
              `Unexpected error: Gradle failed with status code ${code}`
            )
          );
        }
        resolve(task);
      });
      child.on("error", (err) => {
        reject(err);
      });
    }
  });
}

/**
 * @param {string} cwd the path of current working directory
 * @return A promise that resolves version of the target project
 */
export function getVersion(
  cwd: string,
  env: NodeJS.ProcessEnv
): Promise<string> {
  return new Promise(async (resolve, reject) => {
    const command = await getCommand(cwd);
    const child = spawn(command, ["properties", "-q"], {
      cwd,
      env,
      stdio: ["inherit", "pipe"],
    });
    if (child.stdout === null) {
      reject(new Error("Unexpected error: stdout of subprocess is null"));
    } else {
      let version = "";
      child.stdout.pipe(split()).on("data", (line: string) => {
        if (line.startsWith("version:")) {
          version = line.substring("version:".length).trim();
        }
      });
      child.on("close", (code: number) => {
        if (code !== 0) {
          reject(
            new Error(
              `Unexpected error: Gradle failed with status code ${code}`
            )
          );
        }
        resolve(version);
      });
      child.on("error", (err) => {
        reject(err);
      });
    }
  });
}

export function buildOptions(env: NodeJS.ProcessEnv): string[] {
  const options = [];
  /* tslint:disable:no-string-literal */
  if (env["GRADLE_PUBLISH_KEY"]) {
    options.push(`-Pgradle.publish.key=${env["GRADLE_PUBLISH_KEY"]}`);
  }
  if (env["GRADLE_PUBLISH_SECRET"]) {
    options.push(`-Pgradle.publish.secret=${env["GRADLE_PUBLISH_SECRET"]}`);
  }
  /* tslint:enable:no-string-literal */
  return options;
}

export function publishArtifact(
  cwd: string,
  env: NodeJS.ProcessEnv,
  logger: Signale
) {
  return new Promise(async (resolve, reject) => {
    const command = getCommand(cwd);
    const task = getTaskToPublish(cwd, env, logger);
    const options = [await task, "-q"].concat(buildOptions(env));
    logger.info(`launching child process with options: ${options.join(" ")}`);
    const child = spawn(await command, options, { cwd, env });
    child.on("close", (code) => {
      if (code !== 0) {
        reject(`Failed to publish: Gradle failed with status code ${code}.`);
      } else {
        resolve(void 0);
      }
    });
  });
}
