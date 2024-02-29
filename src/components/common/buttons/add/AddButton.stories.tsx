import { StoryObj, Meta } from '@storybook/react';
import AddButton from './AddButton';
import { mockAddButtonProps } from './AddButton.mocks';

const meta: Meta<typeof AddButton> = {
	title: 'dashboard/AddButton',
  component: AddButton,
};

export default meta;

type Story = StoryObj<typeof AddButton>;

export const Primary: Story = {
    render: () => <AddButton { ...mockAddButtonProps.base } />,
};