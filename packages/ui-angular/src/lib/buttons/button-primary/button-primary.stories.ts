import { Meta, StoryObj } from '@storybook/angular';
import { ButtonPrimaryComponent } from './button-primary.component';
import { action } from '@storybook/addon-actions';


const meta = {
  title: 'Components/ButtonPrimary',
  component: ButtonPrimaryComponent
} satisfies Meta<ButtonPrimaryComponent>;

export default meta;

type Story = StoryObj<ButtonPrimaryComponent>;

export const Default: Story = {
  args: {
    buttonLabel: 'Click me',
    disabled: false,
    onClick: action('Box clicked'),
  },
  parameters: {
    docs: { disable: true }
  }
};

export const Disabled: Story = {
  args: {
    buttonLabel: 'Disabled',
    disabled: true
  }
};
