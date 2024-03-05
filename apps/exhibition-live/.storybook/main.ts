import {StorybookConfig} from "@storybook/nextjs";

const config: StorybookConfig = {
  "stories": [
    //"../stories/**/*.stories.mdx"
    "../components/**/*.stories.@(js|jsx|ts|tsx)",
  ],

  "addons": [
    "@storybook/addon-docs",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
  ],
  staticDirs: ['../public'],

  "framework": {
    name: "@storybook/nextjs",
    options: {}
  },
  docs: {
    autodocs: true
  },
  /*
  webpackFinal: async (config) => {
    // Remove existing mdx rule if any (but should be none)
    config.module.rules = config.module.rules.filter((f) => (f as any).test?.toString() !== '/\\.mdx$/')

    config.module.rules.push({
      test: /\.mdx$/,
      use: ['@mdx-js/loader'],
    })

    return config
  },*/
}

export default config;
