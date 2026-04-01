import { Meta, StoryObj } from '@storybook/angular';
import { SelectComponent } from './select.component';

const meta: Meta<SelectComponent> = {
  title: 'Form/Select',
  component: SelectComponent,
  argTypes: {}
};

export default meta;
type Story = StoryObj<SelectComponent>;

export const Base: Story = {
  args: {
    label: 'Pays',
    options: [
      { label: 'France', value: 'fr' },
      { label: 'Allemagneoiuaze', value: 'de' },
      { label: 'Espagne', value: 'es' },
    ],
  },
};
