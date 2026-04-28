import { defaultPreset } from "./default";
import { web3Preset } from "./web3";
import type { Preset } from "../types";

const presets = new Map<string, Preset>([
  [defaultPreset.name, defaultPreset],
  [web3Preset.name, web3Preset],
]);

export function getPreset(name: string): Preset {
  return presets.get(name) ?? defaultPreset;
}

export function listPresetNames() {
  return [...presets.keys()];
}
