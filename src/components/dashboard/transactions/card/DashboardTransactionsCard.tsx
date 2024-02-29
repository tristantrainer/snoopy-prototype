'use client';

import { stylesClassNames } from '@/lib/common/classNames';
import Card from '../../card/Card';
import styles from './DashboardTransactionsCard.module.scss';
import AddTransactionModal from '@/components/transactions/AddTransactionModal/AddTransactionModal';
import React from 'react';
import DashboardTransactionsTable from '../table/DashboardTransactionsTable';
import TransactionsProvider from '@/components/providers/transactions/TransactionsProvider';

const classNames = stylesClassNames(styles);

export type DashboardTransactionsCardProps = {
  className?: string,
}

function DashboardTransactionsCard({ className }: DashboardTransactionsCardProps){
  return (
    <Card className={classNames(className, "card")}>
      <Card.Header title="Transactions">
        <div>
          <AddTransactionModal />
        </div>
      </Card.Header>
      <Card.Content className={classNames("content")}>
        <TransactionsProvider>
          {(transactions, { loadNextPage }) => (
            <DashboardTransactionsTable className={classNames("table")} transactions={transactions} onScrollToBottom={() => { console.log("Last Visible"); loadNextPage()}} />
          )}
        </TransactionsProvider>
      </Card.Content>
    </Card>
  );
};

export default DashboardTransactionsCard;