import { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { ReactiveFormsModule, FormControl, FormsModule } from '@angular/forms';
import { CheckboxComponent } from './checkbox.component';

const meta: Meta<CheckboxComponent> = {
  title: 'Form/Checkbox',
  component: CheckboxComponent,
  decorators: [
    moduleMetadata({
      imports: [ReactiveFormsModule, FormsModule],
    }),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<CheckboxComponent>;


export const NgModel: Story = {
  render: (args) => ({
    component: CheckboxComponent,
    props: args,
    template: `
      <sh3-checkbox [(ngModel)]="value" [label]="label"></sh3-checkbox>
      <p>Valeur : {{ value }}</p>
    `,
  }),
  args: {
    label: 'I accept the terms and conditions',
    value: true,
  },
};


export const ReactiveForms: Story = {
  render: (args) => {
    const control = new FormControl(true);
    return {
      component: CheckboxComponent,
      props: {
        ...args,
        control,
      },
      template: `
        <form [formGroup]="{ control: control }">
          <sh3-checkbox [formControl]="control" [label]="label"></sh3-checkbox>
          <p>Valeur : {{ control.value }}</p>
        </form>
      `,
    };
  },
  args: {
    label: 'Subscribe to newsletter',
  },
};
