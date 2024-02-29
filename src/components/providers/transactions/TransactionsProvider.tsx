"use client"

import React, { ReactNode } from 'react';
import styles from './TransactionsProvider.module.scss';
import { TransactionType, useGetTransactionsQuery } from '@/lib/woodstock/client/queries/useGetTransactionsQuery';
import { stylesClassNames } from '@/lib/common/classNames';

const classNames = stylesClassNames(styles);

export type TransactionsTableActions = {
  loadNextPage: () => void,
}

export type TransactionsTableProps = {
  children: (transactions: TransactionType[], actions: TransactionsTableActions) => ReactNode
}

function TransactionsProvider({ children }: TransactionsTableProps) {
  const { transactions, loading, error, loadNextPage } = useGetTransactionsQuery({
    pageSize: 10,
    cursor: null,
    where: { description: { contains: "" } }
  });

  if(loading || !transactions || error) {
    return <div>Loading</div>
  }

  return (
    <>
      {children(transactions, { loadNextPage })}
    </>
  )
}

export default TransactionsProvider;