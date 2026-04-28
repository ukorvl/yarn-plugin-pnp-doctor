import { BaseCommand } from "@yarnpkg/cli";
import { Configuration, Project } from "@yarnpkg/core";
import { Command, Option } from "clipanion";

import { analyzeProject } from "../core/analyzer";
import {
  filterReport,
  formatJsonReport,
  formatTextReport,
  hasSeverityAtLeast,
  parseSeverityFilter,
} from "../core/report";
import { snapshotYarnProject } from "../core/yarnProject";

export class PnpDoctorCommand extends BaseCommand {
  static override readonly paths = [[`pnp-doctor`], [`doctor`, `pnp`]];

  static override readonly usage = Command.Usage({
    description: `Diagnose likely Yarn Plug'n'Play compatibility problems.`,
    details: `
      This command inspects Yarn's resolved Project model and reports graph shapes
      that often become runtime problems under Plug'n'Play.

      Presets keep the mental model focused. The default preset runs core checks,
      while the web3 preset adds ecosystem-specific watch rules for Hardhat,
      WalletConnect, Solana, ABI/codegen, and related stacks.
    `,
    examples: [
      [`Scan the current project`, `yarn pnp-doctor`],
      [`Scan with the web3 preset`, `yarn pnp-doctor --preset web3`],
      [`Emit JSON for tooling`, `yarn pnp-doctor --preset web3 --json`],
    ],
  });

  preset = Option.String(`--preset`, `default`, {
    description: `Preset to run. Available presets: default, web3.`,
  });

  severity = Option.String(`--severity`, `info`, {
    description: `Minimum severity to print: info, warning, or error.`,
  });

  failOn = Option.String(`--fail-on`, `error`, {
    description: `Exit non-zero at this severity: info, warning, error, or none.`,
  });

  json = Option.Boolean(`--json`, false, {
    description: `Print the report as JSON.`,
  });

  async execute() {
    const configuration = await Configuration.find(this.context.cwd, this.context.plugins);
    const { project } = await Project.find(configuration, this.context.cwd);

    await project.restoreInstallState();

    const snapshot = snapshotYarnProject(project);
    const report = analyzeProject(snapshot, {
      presetName: this.preset,
    });
    const filteredReport = filterReport(report, parseSeverityFilter(this.severity));

    this.context.stdout.write(
      this.json ? formatJsonReport(filteredReport) : formatTextReport(filteredReport)
    );

    const failSeverity = parseSeverityFilter(this.failOn, {
      allowNone: true,
    });

    if (failSeverity !== `none` && hasSeverityAtLeast(report.findings, failSeverity)) return 1;

    return 0;
  }
}
