import { statSync } from "node:fs";
import { resolve } from "node:path";

const bundlePath = resolve("bundles/@yarnpkg/plugin-pnp-doctor.js");
const defaultLimitBytes = 64 * 1024;
const limitBytes = Number.parseInt(
  process.env.BUNDLE_SIZE_LIMIT_BYTES ?? `${defaultLimitBytes}`,
  10,
);

if (!Number.isSafeInteger(limitBytes) || limitBytes <= 0) {
  throw new Error("BUNDLE_SIZE_LIMIT_BYTES must be a positive integer.");
}

const { size } = statSync(bundlePath);

const formatBytes = (bytes) => `${(bytes / 1024).toFixed(2)} KiB`;

if (size > limitBytes) {
  console.error(
    `Bundle is ${formatBytes(size)}, which exceeds the ${formatBytes(limitBytes)} limit.`,
  );
  process.exitCode = 1;
} else {
  console.log(
    `Bundle size OK: ${formatBytes(size)} / ${formatBytes(limitBytes)}.`,
  );
}
