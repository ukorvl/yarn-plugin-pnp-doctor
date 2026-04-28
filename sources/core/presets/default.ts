import type { Preset } from "../types";

export const defaultPreset: Preset = {
  name: `default`,
  description: `Core PnP project checks with no ecosystem assumptions.`,
  watchRules: [],
  packageExtensionRules: [],
  majorAlignmentIdents: [],
  nativeBinaryIdents: [],
};
