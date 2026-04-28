import type { Plugin } from "@yarnpkg/core";

import { PnpDoctorCommand } from "./commands/PnpDoctorCommand";

const plugin: Plugin = {
  commands: [PnpDoctorCommand],
};

export default plugin;
