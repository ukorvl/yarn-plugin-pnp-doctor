import { type Project, structUtils } from "@yarnpkg/core";

import type { InstalledPackage, ProjectSnapshot } from "./types";

export function snapshotYarnProject(project: Project): ProjectSnapshot {
  const packages: Array<InstalledPackage> = [];

  for (const pkg of project.storedPackages.values()) {
    if (structUtils.isVirtualLocator(pkg)) continue;

    packages.push({
      ident: structUtils.stringifyIdent(pkg),
      locator: structUtils.stringifyLocator(pkg),
      version: pkg.version,
      dependencies: Array.from(pkg.dependencies.values(), descriptor =>
        structUtils.stringifyIdent(descriptor)
      ),
      peerDependencies: Array.from(pkg.peerDependencies.values(), descriptor =>
        structUtils.stringifyIdent(descriptor)
      ),
    });
  }

  return {
    cwd: project.cwd,
    nodeLinker: readNodeLinker(project),
    packages,
  };
}

function readNodeLinker(project: Project) {
  try {
    const configuration = project.configuration as { get: (name: string) => unknown };
    const nodeLinker = configuration.get(`nodeLinker`);
    return typeof nodeLinker === `string` ? nodeLinker : null;
  } catch {
    return null;
  }
}
