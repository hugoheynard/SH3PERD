import { Meta, StoryObj } from '@storybook/angular';
import { InputComponent } from './input.component';

export default {
  title: 'Form/Input',
  component: InputComponent,
} satisfies Meta<InputComponent>;

export const Default: StoryObj<InputComponent> = {
  args: {
    placeholder: 'Type something…',
  },
};

export const Small: StoryObj<InputComponent> = {
  args: {
    size: 'sm',
    placeholder: 'Small input',
  },
};

export const NumberCentered: StoryObj<InputComponent> = {
  args: {
    type: 'number',
    size: 'sm',
    align: 'center',
    placeholder: 'BPM',
    min: 1,
  },
};
