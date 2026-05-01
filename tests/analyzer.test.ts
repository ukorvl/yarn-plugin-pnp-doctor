import { describe, expect, it } from "vitest";

import { analyzeProject } from "../sources/core/analyzer";
import type { ProjectSnapshot } from "../sources/core/types";

describe(`analyzeProject`, () => {
  it(`reports empty installs`, () => {
    const report = analyzeProject(project(), {
      presetName: `default`,
    });

    expect(report.findings).toContainEqual(
      expect.objectContaining({
        code: `PNP002`,
        severity: `warning`,
      })
    );
  });

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

  it(`only emits native binary findings when running under PnP`, () => {
    const pnpReport = analyzeProject(
      project({
        packages: [pkg(`@swc/core`, `@swc/core@npm:1.7.0`, `1.7.0`)],
      }),
      {
        presetName: `web3`,
      }
    );
    const nodeModulesReport = analyzeProject(
      project({
        nodeLinker: `node-modules`,
        packages: [pkg(`@swc/core`, `@swc/core@npm:1.7.0`, `1.7.0`)],
      }),
      {
        presetName: `web3`,
      }
    );

    expect(pnpReport.findings).toContainEqual(
      expect.objectContaining({
        code: `PNP_NATIVE_BINARY`,
        packageIdent: `@swc/core`,
      })
    );
    expect(nodeModulesReport.findings).not.toContainEqual(
      expect.objectContaining({
        code: `PNP_NATIVE_BINARY`,
      })
    );
  });

  it(`detects web3 major splits`, () => {
    const report = analyzeProject(
      project({
        packages: [
          pkg(`ethers`, `ethers@npm:5.7.2`, `5.7.2`),
          pkg(`ethers`, `ethers@npm:6.15.0`, `6.15.0`),
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

  it(`ignores same-major and unknown versions`, () => {
    const report = analyzeProject(
      project({
        packages: [
          pkg(`ethers`, `ethers@npm:5.0.0`, `5.0.0`),
          pkg(`ethers`, `ethers@npm:5.7.2`, `5.7.2`),
          pkg(`ethers`, `ethers@npm:unknown`, null),
        ],
      }),
      {
        presetName: `web3`,
      }
    );

    expect(report.findings).not.toContainEqual(
      expect.objectContaining({
        code: `PNP_MAJOR_SPLIT`,
      })
    );
  });

  it(`emits web3 package watch findings`, () => {
    const report = analyzeProject(
      project({
        packages: [pkg(`hardhat`, `hardhat@npm:2.22.0`, `2.22.0`)],
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

function pkg(ident: string, locator: string, version: string | null) {
  return {
    ident,
    locator,
    version,
    dependencies: [],
    peerDependencies: [],
  };
}
