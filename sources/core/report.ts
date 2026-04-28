import type {
  DoctorReport,
  Finding,
  PackageExtensionSuggestion,
  Severity,
  SeverityFilter,
} from "./types";

const severityRank: Record<Severity, number> = {
  info: 0,
  warning: 1,
  error: 2,
};

export function parseSeverityFilter(
  input: string,
  options: { allowNone?: boolean } = {}
): SeverityFilter {
  if (input === `info` || input === `warning` || input === `error`) return input;

  if (options.allowNone && input === `none`) return `none`;

  return options.allowNone ? `error` : `info`;
}

export function filterReport(report: DoctorReport, minimumSeverity: SeverityFilter): DoctorReport {
  if (minimumSeverity === `none`)
    return { ...report, findings: [], summary: { info: 0, warning: 0, error: 0 } };

  const findings = report.findings.filter(
    finding => severityRank[finding.severity] >= severityRank[minimumSeverity]
  );

  return {
    ...report,
    findings,
    summary: summarizeFindings(findings),
  };
}

export function hasSeverityAtLeast(findings: Array<Finding>, minimumSeverity: Severity) {
  return findings.some(finding => severityRank[finding.severity] >= severityRank[minimumSeverity]);
}

export function formatJsonReport(report: DoctorReport) {
  return `${JSON.stringify(report, null, 2)}\n`;
}

export function formatTextReport(report: DoctorReport) {
  const lines = [
    `PnP Doctor`,
    `Preset: ${report.preset}`,
    `Project: ${report.projectCwd}`,
    `Packages inspected: ${report.inspectedPackages}`,
    `Findings: ${report.summary.error} error, ${report.summary.warning} warning, ${report.summary.info} info`,
    ``,
  ];

  if (report.findings.length === 0) {
    lines.push(`No findings for the selected severity filter.`);
    return `${lines.join(`\n`)}\n`;
  }

  for (const finding of report.findings) {
    lines.push(`[${finding.severity}] ${finding.code}: ${finding.title}`);

    if (finding.locator) lines.push(`  Package: ${finding.locator}`);
    else if (finding.packageIdent) lines.push(`  Package: ${finding.packageIdent}`);

    lines.push(`  ${finding.message}`);

    if (finding.recommendation) lines.push(`  Recommendation: ${finding.recommendation}`);

    if (finding.packageExtension) {
      lines.push(`  Suggested packageExtensions entry:`);
      lines.push(indent(formatPackageExtension(finding.packageExtension), 4));
    }

    lines.push(``);
  }

  return `${lines.join(`\n`)}\n`;
}

function summarizeFindings(findings: Array<Finding>) {
  return {
    info: findings.filter(finding => finding.severity === `info`).length,
    warning: findings.filter(finding => finding.severity === `warning`).length,
    error: findings.filter(finding => finding.severity === `error`).length,
  };
}

function formatPackageExtension(extension: PackageExtensionSuggestion) {
  const lines = [`packageExtensions:`, `  "${extension.selector}":`];

  appendRecord(lines, `dependencies`, extension.dependencies);
  appendRecord(lines, `peerDependencies`, extension.peerDependencies);

  if (extension.peerDependenciesMeta) {
    lines.push(`    peerDependenciesMeta:`);

    for (const [ident, meta] of Object.entries(extension.peerDependenciesMeta)) {
      lines.push(`      "${ident}":`);
      lines.push(`        optional: ${meta.optional ? `true` : `false`}`);
    }
  }

  return lines.join(`\n`);
}

function appendRecord(
  lines: Array<string>,
  key: string,
  record: Record<string, string> | undefined
) {
  if (!record) return;

  lines.push(`    ${key}:`);

  for (const [ident, range] of Object.entries(record)) lines.push(`      "${ident}": "${range}"`);
}

function indent(value: string, spaces: number) {
  const prefix = ` `.repeat(spaces);
  return value
    .split(`\n`)
    .map(line => `${prefix}${line}`)
    .join(`\n`);
}
