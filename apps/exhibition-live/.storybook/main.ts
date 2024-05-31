import { StorybookConfig } from "@storybook/nextjs";

const config: StorybookConfig = {
  stories: [
    "../components/**/*.mdx",
    "../components/**/*.stories.@(js|jsx|ts|tsx)",
    "../../../packages/**/*.stories.@(js|jsx|ts|tsx)",
  ],

  addons: [
    "@storybook/addon-docs",
    "@storybook/addon-links",
    "@storybook/addon-essentials",
    "storybook-addon-next-router",
  ],
  staticDirs: ["../public"],

  framework: {
    name: "@storybook/nextjs",
    options: {
      builder: {
        useSWC: true, // Enables SWC support
      },
    },
  },
  docs: {
    autodocs: true,
  },
  webpackFinal: async (config) => {
    config.module.rules.push({
      test: /\.(nq|ttl)$/i,
      use: [
        {
          loader: "file-loader",
        },
      ],
    });
    return config;
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
};

export default config;
