import { Signale } from "signale";

export interface ILastRelease {
  version: string;
  gitTag: string;
  gitHead: string;
}

export interface INextRelease extends ILastRelease {
  notes: string;
}

/**
 * The context object defined in semantic-release/index.js
 * @see https://github.com/semantic-release/semantic-release/blob/v15.13.3/index.js
 */
export interface IContext {
  // https://nodejs.org/docs/latest-v8.x/api/process.html#process_process_cwd
  cwd: string;
  // https://nodejs.org/docs/latest-v8.x/api/process.html#process_process_env
  env: object;
  // https://nodejs.org/docs/latest-v8.x/api/process.html#process_process_stdout
  stdout: WritableStream;
  // https://nodejs.org/docs/latest-v8.x/api/process.html#process_process_stderr
  stderr: WritableStream;
  // https://github.com/semantic-release/semantic-release/blob/v15.13.3/lib/get-config.js
  options: object;
  nextRelease: INextRelease;
  logger: Signale;
}
