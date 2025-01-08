const js = require('@eslint/js');
const globals = require('globals');
const airbnbBase = require('eslint-config-airbnb-base');

/** @type {import('eslint').Linter.FlatConfig[]} */
module.exports = [
  js.configs.recommended,
  airbnbBase, // Include Airbnb's base configuration directly
  {
    files: ["**/*.js"],
    ignores: ["dist/**"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // Custom rules can be added here
      "no-console": "off",
      "indent": ["error", 2],
    },
  },
];