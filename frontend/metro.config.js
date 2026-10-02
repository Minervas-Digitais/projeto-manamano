const fs = require('fs');
const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const rootEnv = path.resolve(workspaceRoot, '.env');
if (fs.existsSync(rootEnv)) {
  process.loadEnvFile(rootEnv);
}

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];

config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');

config.resolver.sourceExts.push('svg');

config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

module.exports = config;
