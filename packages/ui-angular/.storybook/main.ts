import type { StorybookConfig } from '@storybook/angular';


const config: StorybookConfig = {
  framework: {
    name: '@storybook/angular',
    options: {
      enableIvy: true,
      useStandaloneComponents: true
    }
  },
  core: {
    builder: '@storybook/builder-webpack5',
  },
  stories: ['../src/**/*.stories.@(ts|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    //'@storybook/addon-docs',
    //'@storybook/addon-controls',
    //'@storybook/addon-actions'
  ],
  docs: {
    autodocs: false
  }
};

export default config;
