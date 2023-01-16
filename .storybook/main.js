const {ProvidePlugin} = require("webpack");
module.exports = {
  "stories": [
    "../stories/**/*.stories.mdx",
    "../components/**/*.stories.@(js|jsx|ts|tsx)",
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions"
  ],
  "framework": "@storybook/react",
  "core": {
    "builder": "@storybook/builder-webpack5"
  },
  features: {
    storyStoreV7: true,
  },
  webpackFinal: async (config) => {
    try {
      [
        new ProvidePlugin({
          Buffer: ['buffer', 'Buffer'],
        })
      ].forEach(plugin => {
        config.plugins.push(plugin)
      });

    } catch (e) {
      console.log('cannot load ProvidePlugin Buffer')
    }
    config.resolve.fallback = {
      ...config.resolve.fallback,
      stream: require.resolve("stream-browserify"),
      buffer: require.resolve('buffer'),
    };
    return config;
  }
}
