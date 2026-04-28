import { getPreset } from "./presets";
import type {
  AnalyzeOptions,
  DoctorReport,
  Finding,
  FindingSummary,
  InstalledPackage,
  PackageExtensionRule,
  PackageWatchRule,
  ProjectSnapshot,
} from "./types";

export function analyzeProject(project: ProjectSnapshot, options: AnalyzeOptions): DoctorReport {
  const preset = getPreset(options.presetName);
  const findings: Array<Finding> = [];

  if (project.nodeLinker !== null && project.nodeLinker !== `pnp`) {
    findings.push({
      code: `PNP001`,
      severity: `info`,
      title: `Project is not using the PnP linker`,
      message: `The current nodeLinker is "${project.nodeLinker}", so PnP Doctor can only report graph hygiene hints.`,
      recommendation: `Set nodeLinker: pnp in .yarnrc.yml when you are ready to validate strict Plug'n'Play compatibility.`,
    });
  }

  if (project.packages.length === 0) {
    findings.push({
      code: `PNP002`,
      severity: `warning`,
      title: `No installed packages found`,
      message: `Yarn did not expose any stored packages. The project may need yarn install before it can be diagnosed.`,
      recommendation: `Run yarn install, then rerun yarn pnp-doctor.`,
    });
  }

  const packagesByIdent = groupPackagesByIdent(project.packages);

  for (const rule of preset.watchRules) addWatchRuleFindings(findings, packagesByIdent, rule);

  for (const rule of preset.packageExtensionRules)
    addPackageExtensionFindings(findings, packagesByIdent, rule);

  for (const ident of preset.majorAlignmentIdents)
    addMajorAlignmentFindings(findings, packagesByIdent, ident);

  if (project.nodeLinker === `pnp`) {
    for (const ident of preset.nativeBinaryIdents)
      addNativeBinaryFindings(findings, packagesByIdent, ident);
  }

  return {
    preset: preset.name,
    projectCwd: project.cwd,
    generatedAt: new Date().toISOString(),
    inspectedPackages: project.packages.length,
    summary: summarizeFindings(findings),
    findings,
  };
}

function groupPackagesByIdent(packages: Array<InstalledPackage>) {
  const grouped = new Map<string, Array<InstalledPackage>>();

  for (const pkg of packages) {
    const current = grouped.get(pkg.ident) ?? [];
    current.push(pkg);
    grouped.set(pkg.ident, current);
  }

  return grouped;
}

function addWatchRuleFindings(
  findings: Array<Finding>,
  packagesByIdent: Map<string, Array<InstalledPackage>>,
  rule: PackageWatchRule
) {
  for (const pkg of packagesByIdent.get(rule.ident) ?? []) {
    findings.push({
      code: rule.code,
      severity: rule.severity,
      title: rule.title,
      message: rule.message,
      packageIdent: pkg.ident,
      locator: pkg.locator,
      recommendation: rule.recommendation,
    });
  }
}

function addPackageExtensionFindings(
  findings: Array<Finding>,
  packagesByIdent: Map<string, Array<InstalledPackage>>,
  rule: PackageExtensionRule
) {
  for (const pkg of packagesByIdent.get(rule.ident) ?? []) {
    const missingDependencies = pickMissing(rule.dependencies, pkg.dependencies);
    const missingPeerDependencies = pickMissing(rule.peerDependencies, pkg.peerDependencies);

    if (
      Object.keys(missingDependencies).length === 0 &&
      Object.keys(missingPeerDependencies).length === 0 &&
      !rule.peerDependenciesMeta
    ) {
      continue;
    }

    findings.push({
      code: `PNP_PACKAGE_EXTENSION`,
      severity: `warning`,
      title: `Package extension candidate`,
      message: rule.reason,
      packageIdent: pkg.ident,
      locator: pkg.locator,
      recommendation: `Review and add the suggested packageExtensions entry if the package fails at runtime.`,
      packageExtension: {
        selector: rule.selector,
        dependencies: emptyToUndefined(missingDependencies),
        peerDependencies: emptyToUndefined(missingPeerDependencies),
        peerDependenciesMeta: rule.peerDependenciesMeta,
      },
    });
  }
}

function addMajorAlignmentFindings(
  findings: Array<Finding>,
  packagesByIdent: Map<string, Array<InstalledPackage>>,
  ident: string
) {
  const packages = packagesByIdent.get(ident) ?? [];
  const majors = new Map<string, Array<InstalledPackage>>();

  for (const pkg of packages) {
    const major = getMajor(pkg.version);
    if (major === null) continue;

    const current = majors.get(major) ?? [];
    current.push(pkg);
    majors.set(major, current);
  }

  if (majors.size <= 1) return;

  findings.push({
    code: `PNP_MAJOR_SPLIT`,
    severity: `warning`,
    title: `Multiple major versions detected`,
    message: `${ident} is installed across ${majors.size} major versions: ${[...majors.keys()].join(`, `)}.`,
    packageIdent: ident,
    recommendation: `Confirm this split is intentional. Mixed majors are a common source of peer virtualization and runtime confusion in web3 stacks.`,
  });
}

function addNativeBinaryFindings(
  findings: Array<Finding>,
  packagesByIdent: Map<string, Array<InstalledPackage>>,
  ident: string
) {
  for (const pkg of packagesByIdent.get(ident) ?? []) {
    findings.push({
      code: `PNP_NATIVE_BINARY`,
      severity: `info`,
      title: `Native or binary-adjacent package detected`,
      message: `${ident} may load generated, native, or platform-specific files at runtime.`,
      packageIdent: pkg.ident,
      locator: pkg.locator,
      recommendation: `If it fails from inside the Yarn cache, verify whether the package needs dependenciesMeta.unplugged or a packageExtension.`,
    });
  }
}

function pickMissing(expected: Record<string, string> | undefined, actual: Array<string>) {
  const actualSet = new Set(actual);
  const missing: Record<string, string> = {};

  for (const [ident, range] of Object.entries(expected ?? {})) {
    if (!actualSet.has(ident)) missing[ident] = range;
  }

  return missing;
}

function emptyToUndefined<T extends Record<string, unknown>>(value: T) {
  return Object.keys(value).length === 0 ? undefined : value;
}

function getMajor(version: string | null) {
  if (version === null) return null;

  const match = /^(\d+)\./.exec(version);
  return match?.[1] ?? null;
}

function summarizeFindings(findings: Array<Finding>): FindingSummary {
  const summary: FindingSummary = {
    info: 0,
    warning: 0,
    error: 0,
  };

  for (const finding of findings) summary[finding.severity] += 1;

  return summary;
}
