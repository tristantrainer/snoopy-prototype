import { StoryObj, Meta } from '@storybook/react';
import TransactionsProvider from './TransactionsProvider';
import { mockTransactionsListProps } from './TransactionsProvider.mocks';
import { MockWoodstockGraphQLClientProvider, createMockClient } from '@/lib/apollo/mock/client';
import { MockWoodstockSubscriptionProvider } from '@/lib/apollo/hooks/useQueryUpdateSubscription';

const meta: Meta<typeof TransactionsProvider> = {
	title: 'dashboard/TransactionsTable',
  component: TransactionsProvider,
};

export default meta;

type Story = StoryObj<typeof TransactionsProvider>;

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
        <TransactionsProvider { ...mockTransactionsListProps.base } />
      </MockWoodstockSubscriptionProvider>
    </MockWoodstockGraphQLClientProvider>
  ),
};