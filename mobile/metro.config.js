const { withNativeWind } = require("nativewind/metro");
const {
  getSentryExpoConfig
} = require("@sentry/react-native/metro");

const config = getSentryExpoConfig(__dirname);

// Add path alias resolution for @ imports
config.resolver = {
  ...config.resolver,
  extraNodeModules: new Proxy(
    {},
    {
      get: (target, prop) => {
        if (prop === "@") {
          return `${__dirname}`;
        }
        return null;
      },
    }
  ),
};

module.exports = withNativeWind(config, { input: "./global.css" });