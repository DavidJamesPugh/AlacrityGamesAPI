const js = require('@eslint/js');
const importPlugin = require('eslint-plugin-import');

module.exports = {
  ignorePatterns: ['dist/*'], // Ignore the dist folder and its contents
  extends: [
    'eslint:recommended', // Base recommended ESLint rules
    'airbnb-base', // Airbnb base configuration
  ],
  plugins: ['import'], // Manually include the import plugin
  rules: {
    // Rules from eslint-plugin-import and custom rules
    'import/no-unresolved': 'error',
    'import/named': 'error',
    'import/default': 'error',
    'import/namespace': 'error',
    'import/no-absolute-path': 'error',
    'import/no-dynamic-require': 'error',
    'import/no-internal-modules': 'off', // Disabled for now
    'import/no-extraneous-dependencies': ['error', { devDependencies: true }],
    'import/no-mutable-exports': 'error',
    'import/no-unused-modules': ['error', { unusedExports: true }],
    'import/first': 'error',
    'import/exports-last': 'error',
    'import/no-duplicates': 'error',
    'import/no-named-as-default': 'error',
    'import/no-named-as-default-member': 'error',
    'import/no-commonjs': 'error',
    'import/no-amd': 'error',
    'import/no-nodejs-modules': 'error',
    'no-console': 'off', // Custom rules
    'import/order': [
      'error',
      {
        groups: [['builtin', 'external'], ['internal'], ['parent', 'sibling', 'index']],
      },
    ],
    'import/newline-after-import': 'error',
    'import/prefer-default-export': 'off',
  },
  env: {
    es2021: true, // You can adjust this depending on your setup
    node: true, // Assuming you're working with Node.js
  },
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module', // Use ES6 module syntax
  },
};
