//import '../src/styles/index.scss';

export const parameters = {
  layout: 'centered',
  angularLegacyRendering: false
};

export const globalTypes = {
  theme: {
    name: 'Theme',
    description: 'Global theme for components',
    defaultValue: 'dark',
    toolbar: {
      icon: 'circlehollow',
      items: ['light', 'dark'],
    },
  },
};



export const decorators = [
  (storyFn, context) => {
    const theme = context.globals.theme;
    document.body.setAttribute('data-theme', theme);

    return storyFn(); // important de retourner le rendu
  }
];
