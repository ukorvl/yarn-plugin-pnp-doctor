import { describe, expect, it } from "vitest";

import { analyzeProject } from "../sources/core/analyzer";
import type { ProjectSnapshot } from "../sources/core/types";

describe(`analyzeProject`, () => {
  it(`reports non-PnP linker mode`, () => {
    const report = analyzeProject(
      project({
        nodeLinker: `node-modules`,
      }),
      {
        presetName: `default`,
      }
    );

    expect(report.findings).toContainEqual(
      expect.objectContaining({
        code: `PNP001`,
        severity: `info`,
      })
    );
  });

  it(`detects web3 major splits`, () => {
    const report = analyzeProject(
      project({
        packages: [
          {
            ident: `ethers`,
            locator: `ethers@npm:5.7.2`,
            version: `5.7.2`,
            dependencies: [],
            peerDependencies: [],
          },
          {
            ident: `ethers`,
            locator: `ethers@npm:6.15.0`,
            version: `6.15.0`,
            dependencies: [],
            peerDependencies: [],
          },
        ],
      }),
      {
        presetName: `web3`,
      }
    );

    expect(report.findings).toContainEqual(
      expect.objectContaining({
        code: `PNP_MAJOR_SPLIT`,
        severity: `warning`,
        packageIdent: `ethers`,
      })
    );
  });

  it(`emits web3 package watch findings`, () => {
    const report = analyzeProject(
      project({
        packages: [
          {
            ident: `hardhat`,
            locator: `hardhat@npm:2.22.0`,
            version: `2.22.0`,
            dependencies: [],
            peerDependencies: [],
          },
        ],
      }),
      {
        presetName: `web3`,
      }
    );

    expect(report.findings).toContainEqual(
      expect.objectContaining({
        code: `WEB3_HARDHAT_STACK`,
        severity: `warning`,
        packageIdent: `hardhat`,
      })
    );
  });
});

function project(overrides: Partial<ProjectSnapshot> = {}): ProjectSnapshot {
  return {
    cwd: `/repo`,
    nodeLinker: `pnp`,
    packages: [],
    ...overrides,
  };
}
