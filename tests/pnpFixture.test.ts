import { beforeAll, afterAll, describe, expect, it } from "vitest";

import { analyzeProject } from "../sources/core/analyzer";
import type { DoctorReport } from "../sources/core/types";
import {
  loadInstalledProjectSnapshot,
  prepareWeb3FixtureProject,
  runPnpDoctorCommand,
} from "./fixtureProject";

describe.sequential(`real Yarn project fixtures`, () => {
  describe(`with nodeLinker: pnp`, () => {
    let fixture: Awaited<ReturnType<typeof prepareWeb3FixtureProject>>;

    beforeAll(async () => {
      fixture = await prepareWeb3FixtureProject();
    }, 60_000);

    afterAll(async () => {
      await fixture?.cleanup();
    });

    it(`snapshots installed packages from a real PnP project`, async () => {
      const snapshot = await loadInstalledProjectSnapshot(fixture.cwd);
      const packageIdents = snapshot.packages.map(pkg => pkg.ident);
      const ethersVersions = snapshot.packages
        .filter(pkg => pkg.ident === `ethers`)
        .map(pkg => pkg.version)
        .sort();

      expect(snapshot.nodeLinker).toBe(`pnp`);
      expect(snapshot.packages).toHaveLength(12);
      expect(packageIdents).toEqual(
        expect.arrayContaining([
          `hardhat`,
          `@nomicfoundation/hardhat-toolbox`,
          `@nomiclabs/hardhat-ethers`,
          `@walletconnect/ethereum-provider`,
          `@solana/web3.js`,
          `@wagmi/cli`,
          `@swc/core`,
        ])
      );
      expect(ethersVersions).toEqual([`5.7.2`, `6.15.0`]);
    });

    it(`finds the expected web3 warnings and infos from a real install`, async () => {
      const snapshot = await loadInstalledProjectSnapshot(fixture.cwd);
      const report = analyzeProject(snapshot, {
        presetName: `web3`,
      });

      expect(report.inspectedPackages).toBe(12);
      expect(report.summary).toEqual({
        info: 4,
        warning: 4,
        error: 0,
      });
      expect(sortedFindingCodes(report)).toEqual([
        `PNP_MAJOR_SPLIT`,
        `PNP_NATIVE_BINARY`,
        `WEB3_CODEGEN_STACK`,
        `WEB3_HARDHAT_STACK`,
        `WEB3_HARDHAT_TOOLBOX`,
        `WEB3_LEGACY_HARDHAT_ETHERS`,
        `WEB3_SOLANA_STACK`,
        `WEB3_WALLETCONNECT_PROVIDER`,
      ]);
      expect(report.findings).toContainEqual(
        expect.objectContaining({
          code: `PNP_MAJOR_SPLIT`,
          packageIdent: `ethers`,
          severity: `warning`,
        })
      );
    });

    it(`emits the same findings through the command JSON output`, async () => {
      const result = await runPnpDoctorCommand({
        cwd: fixture.cwd,
        preset: `web3`,
        failOn: `none`,
        json: true,
      });
      const report = JSON.parse(result.output) as DoctorReport;

      expect(result.exitCode).toBe(0);
      expect(report.inspectedPackages).toBe(12);
      expect(report.summary).toEqual({
        info: 4,
        warning: 4,
        error: 0,
      });
      expect(sortedFindingCodes(report)).toEqual([
        `PNP_MAJOR_SPLIT`,
        `PNP_NATIVE_BINARY`,
        `WEB3_CODEGEN_STACK`,
        `WEB3_HARDHAT_STACK`,
        `WEB3_HARDHAT_TOOLBOX`,
        `WEB3_LEGACY_HARDHAT_ETHERS`,
        `WEB3_SOLANA_STACK`,
        `WEB3_WALLETCONNECT_PROVIDER`,
      ]);
    });

    it(`filters info findings at the command layer`, async () => {
      const result = await runPnpDoctorCommand({
        cwd: fixture.cwd,
        preset: `web3`,
        severity: `warning`,
        failOn: `none`,
        json: true,
      });
      const report = JSON.parse(result.output) as DoctorReport;

      expect(report.summary).toEqual({
        info: 0,
        warning: 4,
        error: 0,
      });
      expect(sortedFindingCodes(report)).toEqual([
        `PNP_MAJOR_SPLIT`,
        `WEB3_HARDHAT_STACK`,
        `WEB3_HARDHAT_TOOLBOX`,
        `WEB3_LEGACY_HARDHAT_ETHERS`,
      ]);
    });

    it(`returns a non-zero exit code when fail-on matches the real findings`, async () => {
      const failOnWarning = await runPnpDoctorCommand({
        cwd: fixture.cwd,
        preset: `web3`,
        failOn: `warning`,
      });
      const failOnError = await runPnpDoctorCommand({
        cwd: fixture.cwd,
        preset: `web3`,
        failOn: `error`,
      });

      expect(failOnWarning.exitCode).toBe(1);
      expect(failOnError.exitCode).toBe(0);
    });

    it(`prints a readable text report for a real install`, async () => {
      const result = await runPnpDoctorCommand({
        cwd: fixture.cwd,
        preset: `web3`,
        failOn: `none`,
      });

      expect(result.output).toContain(`PnP Doctor`);
      expect(result.output).toContain(`Findings: 0 error, 4 warning, 4 info`);
      expect(result.output).toContain(`Package: hardhat@file:./vendors/hardhat`);
      expect(result.output).toContain(`PNP_NATIVE_BINARY`);
    });
  });

  describe(`with nodeLinker: node-modules`, () => {
    let fixture: Awaited<ReturnType<typeof prepareWeb3FixtureProject>>;

    beforeAll(async () => {
      fixture = await prepareWeb3FixtureProject({
        nodeLinker: `node-modules`,
      });
    }, 60_000);

    afterAll(async () => {
      await fixture?.cleanup();
    });

    it(`reports non-PnP mode but still keeps the graph-shape findings`, async () => {
      const snapshot = await loadInstalledProjectSnapshot(fixture.cwd);
      const report = analyzeProject(snapshot, {
        presetName: `web3`,
      });

      expect(snapshot.nodeLinker).toBe(`node-modules`);
      expect(report.summary).toEqual({
        info: 4,
        warning: 4,
        error: 0,
      });
      expect(sortedFindingCodes(report)).toContain(`PNP001`);
      expect(sortedFindingCodes(report)).not.toContain(`PNP_NATIVE_BINARY`);
    });
  });
});

function sortedFindingCodes(report: Pick<DoctorReport, `findings`>) {
  return report.findings.map(finding => finding.code).sort();
}
