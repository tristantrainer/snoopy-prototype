import { StoryObj, Meta } from '@storybook/react';
import DashboardTransactionsTable from './DashboardTransactionsTable';
import { mockTransactionsListProps } from './DashboardTransactionsTable.mocks';

const meta: Meta<typeof DashboardTransactionsTable> = {
	title: 'dashboard/DashboardTransactionsTable',
  component: DashboardTransactionsTable,
};

export default meta;

type Story = StoryObj<typeof DashboardTransactionsTable>;

export const Primary: Story = {
  render: () => (
    <DashboardTransactionsTable { ...mockTransactionsListProps.base } />
  ),
};