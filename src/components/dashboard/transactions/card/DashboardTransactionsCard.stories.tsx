import { StoryObj, Meta } from '@storybook/react';
import DashboardTransactionsCard from './DashboardTransactionsCard';
import { mockTransactionsListProps } from './DashboardTransactionsCard.mocks';
import { MockWoodstockGraphQLClientProvider, createMockClient } from '@/lib/apollo/mock/client';
import { MockWoodstockSubscriptionProvider } from '@/lib/apollo/hooks/useQueryUpdateSubscription';

const meta: Meta<typeof DashboardTransactionsCard> = {
	title: 'dashboard/DashboardTransactionsCard',
  component: DashboardTransactionsCard,
};

export default meta;

type Story = StoryObj<typeof DashboardTransactionsCard>;

const client = createMockClient(mockTransactionsListProps.mockData, (operation, data) => {
  if(operation.operationName === 'GetTransactions') {
    return {
      transactions: data.transactions
    };
  } 

  return {
    transactionCategories: data.transactionCategories
  };
});

export const Primary: Story = {
  render: () => (
    <MockWoodstockGraphQLClientProvider client={client}>
      <MockWoodstockSubscriptionProvider>
        <DashboardTransactionsCard { ...mockTransactionsListProps.base } />
      </MockWoodstockSubscriptionProvider>
    </MockWoodstockGraphQLClientProvider>
  ),
};