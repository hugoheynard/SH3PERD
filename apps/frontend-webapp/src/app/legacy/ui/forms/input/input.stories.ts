import { Meta, StoryObj } from '@storybook/angular';
import { InputComponent } from './input.component';

export default {
  title: 'Form/Input',
  component: InputComponent,
} satisfies Meta<InputComponent>;

export const Default: StoryObj<InputComponent> = {
  args: {
    // props par défaut ici si besoin
    label: 'Input Label',
  },
};
