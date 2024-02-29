import { StoryObj, Meta } from '@storybook/react';
import Table from './Table';
import { mockTableProps } from './Table.mocks';

const meta: Meta<typeof Table> = {
	title: 'dashboard/Table',
  component: Table,
};

export default meta;

type Story = StoryObj<typeof Table>;

export const Primary: Story = {
    render: () => (
      <Table>
        <Table.Header>
          <Table.Label>Description</Table.Label>
          <Table.Label>Value</Table.Label>
        </Table.Header>
        <Table.Body data={mockTableProps.data}>
          {(row) => (
            <Table.Row>
              <Table.Cell>{row.description}</Table.Cell>
              <Table.Cell>{row.value}</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    ),
};