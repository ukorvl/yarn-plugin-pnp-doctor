import { execFile, execFileSync } from "node:child_process";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Writable } from "node:stream";
import { promisify } from "node:util";

import { getPluginConfiguration } from "@yarnpkg/cli";
import { Configuration, Project } from "@yarnpkg/core";

import { PnpDoctorCommand } from "../sources/commands/PnpDoctorCommand";
import type { ProjectSnapshot, Severity, SeverityFilter } from "../sources/core/types";
import { snapshotYarnProject } from "../sources/core/yarnProject";

const execFileAsync = promisify(execFile);
const fixtureTemplateCwd = join(process.cwd(), `fixtures`, `projects`, `web3-local-stack`);

interface PreparedFixtureProject {
  cwd: string;
  cleanup: () => Promise<void>;
}

interface RunPnpDoctorCommandOptions {
  cwd: string;
  preset?: string;
  severity?: Severity;
  failOn?: SeverityFilter;
  json?: boolean;
}

export async function prepareWeb3FixtureProject(options: {
  nodeLinker?: `pnp` | `node-modules`;
} = {}): Promise<PreparedFixtureProject> {
  const cwd = await mkdtemp(join(tmpdir(), `pnp-doctor-fixture-`));

  await cp(fixtureTemplateCwd, cwd, {
    recursive: true,
  });

  const yarnrcPath = join(cwd, `.yarnrc.yml`);
  const nodeLinker = options.nodeLinker ?? `pnp`;
  const yarnrc = await readFile(yarnrcPath, `utf8`);

  await writeFile(yarnrcPath, yarnrc.replace(/^nodeLinker: .+$/m, `nodeLinker: ${nodeLinker}`));
  await runYarn(cwd, [`install`]);

  return {
    cwd,
    cleanup: async () => {
      await rm(cwd, {
        recursive: true,
        force: true,
      });
    },
  };
}

export async function loadInstalledProjectSnapshot(cwd: string): Promise<ProjectSnapshot> {
  const projectCwd = cwd as Parameters<typeof Configuration.find>[0];
  const configuration = await Configuration.find(projectCwd, getPluginConfiguration());
  const { project } = await Project.find(
    configuration,
    cwd as Parameters<typeof Project.find>[1]
  );

  await project.restoreInstallState();

  return snapshotYarnProject(project);
}

export async function runPnpDoctorCommand({
  cwd,
  preset = `default`,
  severity = `info`,
  failOn = `error`,
  json = false,
}: RunPnpDoctorCommandOptions) {
  let output = ``;
  const stdout = new Writable({
    write(chunk, _encoding, callback) {
      output += chunk.toString();
      callback();
    },
  });

  const command = new PnpDoctorCommand();

  command.context = {
    cwd,
    env: process.env,
    plugins: getPluginConfiguration(),
    stdin: process.stdin,
    stdout,
    stderr: process.stderr,
    quiet: false,
    colorDepth: 8,
  } as unknown as typeof command.context;
  command.preset = preset;
  command.severity = severity;
  command.failOn = failOn;
  command.json = json;

  const exitCode = await command.execute();

  return {
    exitCode,
    output,
  };
}

async function runYarn(cwd: string, args: Array<string>) {
  const invocation = resolveYarnInvocation();

  try {
    await execFileAsync(invocation.command, [...invocation.prefixArgs, ...args], {
      cwd,
      env: {
        ...process.env,
        YARN_ENABLE_TELEMETRY: `0`,
      },
      encoding: `utf8`,
      maxBuffer: 10 * 1024 * 1024,
    });
  } catch (error) {
    const execError = error as Error & {
      stdout?: string;
      stderr?: string;
    };
    const details = [execError.stdout, execError.stderr].filter(Boolean).join(`\n`);

    throw new Error(`yarn ${args.join(` `)} failed in ${cwd}\n${details}`.trim());
  }
}

function resolveYarnInvocation() {
  const npmExecPath = process.env.npm_execpath;

  if (npmExecPath) {
    if (/\.(?:c|m)?js$/u.test(npmExecPath)) {
      return {
        command: process.execPath,
        prefixArgs: [npmExecPath],
      };
    }

    return {
      command: npmExecPath,
      prefixArgs: [] as Array<string>,
    };
  }

  return {
    command: execFileSync(`which`, [`yarn`], {
      encoding: `utf8`,
    }).trim(),
    prefixArgs: [] as Array<string>,
  };
}
