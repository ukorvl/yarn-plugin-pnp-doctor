const multilineArraysModule = await import("prettier-plugin-multiline-arrays");
const packageJsonModule = await import("prettier-plugin-packagejson");
const shModule = await import("prettier-plugin-sh");
const sortJsonModule = await import("prettier-plugin-sort-json");

const multilineArraysPlugin = multilineArraysModule.default ?? multilineArraysModule;
const packageJsonPlugin = packageJsonModule.default ?? packageJsonModule;
const shPlugin = shModule.default ?? shModule;
const sortJsonPlugin = sortJsonModule.default ?? sortJsonModule;

/** @type {import("prettier").Config} */
const config = {
  arrowParens: "avoid",
  bracketSpacing: true,
  jsonRecursiveSort: true,
  jsonSortOrder:
    '{ "placeThisFirst": null, "/^[a-zA-Z0-9]/": "caseInsensitiveNumeric"  }',
  jsxSingleQuote: false,
  multilineArraysWrapThreshold: 5,
  plugins: [
    sortJsonPlugin,
    packageJsonPlugin,
    multilineArraysPlugin,
    shPlugin,
  ],
  printWidth: 90,
  semi: true,
  singleQuote: false,
  trailingComma: "es5",
  vueIndentScriptAndStyle: true,
};

export default config;
