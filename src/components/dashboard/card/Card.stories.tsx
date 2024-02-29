import { StoryObj, Meta } from '@storybook/react';
import Card from './Card';
import { mockCardProps, mockCardHeaderProps } from './Card.mocks';
import AddButton from '../../common/buttons/add/AddButton';

const meta: Meta<typeof Card> = {
	title: 'dashboard/Card',
  component: Card,
};

export default meta;

type Story = StoryObj<typeof Card>;

export const Primary: Story = {
    render: () => {
      return (
        <Card { ...mockCardProps.base }> 
          <Card.Header {...mockCardHeaderProps.base }>
            <AddButton label="Add Transaction" />
          </Card.Header>
          <Card.Content>
            <div>Some Content</div>
          </Card.Content>
        </Card>
      );
    },
    decorators: [
      (Story) => (
        <div style={{ backgroundColor: "#f1f0f2", padding: "12px" }}>
          <Story />
        </div>
      ),
    ],
};