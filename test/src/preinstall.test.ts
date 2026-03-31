import { mkdtempSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { cwd, execPath } from "process";
import { spawnSync } from "child_process";
import { afterEach, describe, expect, it } from "@jest/globals";

const packageJson = require("../../package.json");

const repositoryRoot = cwd();
const enforcePnpmScript = join(repositoryRoot, "scripts/enforce-pnpm.cjs");
const preinstallCommand = packageJson.scripts.preinstall;
const preinstallPrefix = 'node -e "';
const inlinePreinstallScript = preinstallCommand.slice(
  preinstallPrefix.length,
  -1,
);

const runNodeScript = (
  args: string[],
  options: {
    cwd?: string;
    env?: NodeJS.ProcessEnv;
  } = {},
) =>
  spawnSync(execPath, args, {
    cwd: options.cwd,
    env: options.env,
    encoding: "utf8",
  });

describe("preinstall enforcement", () => {
  const temporaryDirectories: string[] = [];

  afterEach(() => {
    for (const directory of temporaryDirectories) {
      rmSync(directory, { force: true, recursive: true });
    }
    temporaryDirectories.length = 0;
  });

  it("accepts pnpm user agent in the guard script", () => {
    const result = runNodeScript([enforcePnpmScript], {
      env: {
        ...process.env,
        npm_config_user_agent: "pnpm/10.21.0 npm/? node/v22.20.0 darwin arm64",
      },
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
  });

  it("rejects non-pnpm user agent in the guard script", () => {
    const result = runNodeScript([enforcePnpmScript], {
      env: {
        ...process.env,
        npm_config_user_agent: "npm/10.9.3 node/v22.20.0 darwin arm64",
      },
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "This repository must be installed with pnpm.",
    );
    expect(result.stderr).toContain(
      "Run `corepack enable` once, then use `pnpm install`.",
    );
  });

  it("runs the guard for repository root installs", () => {
    const result = runNodeScript(["-e", inlinePreinstallScript], {
      cwd: repositoryRoot,
      env: {
        ...process.env,
        INIT_CWD: repositoryRoot,
        npm_config_user_agent: "npm/10.9.3 node/v22.20.0 darwin arm64",
      },
    });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      "This repository must be installed with pnpm.",
    );
  });

  it("skips the guard for downstream installs", () => {
    const downstreamRoot = mkdtempSync(
      join(tmpdir(), "preinstall-downstream-"),
    );
    temporaryDirectories.push(downstreamRoot);

    const result = runNodeScript(["-e", inlinePreinstallScript], {
      cwd: downstreamRoot,
      env: {
        ...process.env,
        INIT_CWD: join(downstreamRoot, "consumer-project"),
        npm_config_user_agent: "npm/10.9.3 node/v22.20.0 darwin arm64",
      },
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
  });

  it("fails open when INIT_CWD is missing", () => {
    const downstreamRoot = mkdtempSync(
      join(tmpdir(), "preinstall-no-init-cwd-"),
    );
    temporaryDirectories.push(downstreamRoot);

    const environment = { ...process.env };
    delete environment.INIT_CWD;

    const result = runNodeScript(["-e", inlinePreinstallScript], {
      cwd: downstreamRoot,
      env: {
        ...environment,
        npm_config_user_agent: "npm/10.9.3 node/v22.20.0 darwin arm64",
      },
    });

    expect(result.status).toBe(0);
    expect(result.stderr).toBe("");
  });
});
