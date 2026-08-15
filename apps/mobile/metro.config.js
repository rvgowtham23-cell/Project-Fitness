const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
// This app lives in an npm-workspaces monorepo (see root package.json) and imports
// @fitness/shared-types from packages/shared-types, which npm links as a symlink into
// node_modules rather than copying — Metro needs to know about both the monorepo root
// and its hoisted node_modules to resolve that symlink and watch the source for changes.
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];
config.resolver.disableHierarchicalLookup = false;

module.exports = config;
