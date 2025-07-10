const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname, {
  // Enable Expo Router
  isCSSEnabled: true,
});

module.exports = withNativeWind(config, { input: './global.css' });
