export type Severity = `info` | `warning` | `error`;

export type SeverityFilter = Severity | `none`;

export interface ProjectSnapshot {
  cwd: string;
  nodeLinker: string | null;
  packages: Array<InstalledPackage>;
}

export interface InstalledPackage {
  ident: string;
  locator: string;
  version: string | null;
  dependencies: Array<string>;
  peerDependencies: Array<string>;
}

export interface AnalyzeOptions {
  presetName: string;
}

export interface DoctorReport {
  preset: string;
  projectCwd: string;
  generatedAt: string;
  inspectedPackages: number;
  summary: FindingSummary;
  findings: Array<Finding>;
}

export interface FindingSummary {
  info: number;
  warning: number;
  error: number;
}

export interface Finding {
  code: string;
  severity: Severity;
  title: string;
  message: string;
  packageIdent?: string;
  locator?: string;
  recommendation?: string;
  packageExtension?: PackageExtensionSuggestion;
}

export interface PackageExtensionSuggestion {
  selector: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, PackageExtensionPeerMeta>;
}

export interface PackageExtensionPeerMeta {
  optional: boolean;
}

export interface Preset {
  name: string;
  description: string;
  watchRules: Array<PackageWatchRule>;
  packageExtensionRules: Array<PackageExtensionRule>;
  majorAlignmentIdents: Array<string>;
  nativeBinaryIdents: Array<string>;
}

export interface PackageWatchRule {
  ident: string;
  severity: Severity;
  code: string;
  title: string;
  message: string;
  recommendation: string;
}

export interface PackageExtensionRule {
  ident: string;
  selector: string;
  reason: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  peerDependenciesMeta?: Record<string, PackageExtensionPeerMeta>;
}
