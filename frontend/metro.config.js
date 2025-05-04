const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

config.resolver.assetExts = config.resolver.assetExts.filter((ext) => ext !== 'svg');

config.resolver.sourceExts.push('svg');

config.transformer.babelTransformerPath = require.resolve('react-native-svg-transformer');

config.resolver.unstable_conditionNames = ['browser', 'require', 'react-native'];

module.exports = config;
