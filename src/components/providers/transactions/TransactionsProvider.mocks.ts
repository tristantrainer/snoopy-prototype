import { TransactionsTableProps } from './TransactionsProvider';

const base: TransactionsTableProps = {
  children: () => null
};

const mockData = {
  transactionCategories: [{
    id: "d6a28967-d3d7-4d15-ae3e-918b8e7de69e",
    name: "Groceries"
  }],
  transactions: {
    nodes: [{
      value: 123,
      date: "2015-03-25T12:00:00Z",
      id: "d6a28967-d3d7-4d15-ae3e-918b8e7de69e",
      description: "Weekly Shop",
      category: {
          id: "d6a28967-d3d7-4d15-ae3e-918b8e7de69e",
          name: "Groceries",
      }
    }], 
    edges: [{
      cursor: "==MQ",
      node: {
        value: 123,
        date: "2015-03-25T12:00:00Z",
        id: "d6a28967-d3d7-4d15-ae3e-918b8e7de69e",
        description: "Weekly Shop",
        category: {
            id: "d6a28967-d3d7-4d15-ae3e-918b8e7de69e",
            name: "Groceries",
        }
      }
    }],
    pageInfo: {
      hasNextPage: true,
      endCursor: "==MQ"
    }
  }
}


export const mockTransactionsListProps = {
  base,
  mockData,
};