import { stylesClassNames } from '@/lib/common/classNames';
import styles from './DashboardTransactionsTable.module.scss';
import { TransactionType } from '@/lib/woodstock/client/queries/useGetTransactionsQuery';
import React, { ReactNode, UIEventHandler, useCallback } from 'react';
import Table from '@/components/common/table/Table';

const classNames = stylesClassNames(styles);

export type DashboardTransactionsTableProps = {
  className?: string,
  transactions?: TransactionType[],
  onScrollToBottom: () => void
}

function DashboardTransactionsTable({ className, transactions, onScrollToBottom }: DashboardTransactionsTableProps) {
  const handleScroll = useCallback((state: ScrollState) => {
    if(state.offsetBottom <= state.containerHeight) {
      onScrollToBottom();
    }
  }, [onScrollToBottom]);

  return (
    <ScrollContainer className={classNames(className, "container")} onScroll={handleScroll}>
      <Table className={classNames("table")}>
        <Table.Header className={classNames("table-header")}>
            <Table.Label className={classNames("table-cell")}>Description</Table.Label>
            <Table.Label className={classNames("table-cell")}>Category</Table.Label>
            <Table.Label className={classNames("table-cell")}>Date</Table.Label>
            <Table.Label className={classNames("table-cell")}>Value</Table.Label>
        </Table.Header>
        <Table.Body 
          className={classNames("table-body")} 
          data={transactions} 
          emptyState={EmptyState}
        >
          {(transaction) => (
            <Table.Row key={transaction.id}>
              <Table.Cell className={classNames("table-cell")}>{transaction.description}</Table.Cell>
              <Table.Cell className={classNames("table-cell")}>{transaction.category.name}</Table.Cell>
              <Table.Cell className={classNames("table-cell")}>{transaction.date}</Table.Cell>
              <Table.Cell className={classNames("table-cell")}>{transaction.value}</Table.Cell>
            </Table.Row>
          )}
        </Table.Body>
      </Table>
    </ScrollContainer>
  )
}

type ScrollState = {
  top: number,
  height: number,
  containerHeight: number,
  offsetBottom: number
}

type ScrollContainerProps = {
  className?: string, 
  children: ReactNode, 
  onScroll?: (state: ScrollState) => void
}

function ScrollContainer({ className, children, onScroll }: ScrollContainerProps) {
  const handleScroll: UIEventHandler<HTMLTableElement> = useCallback((e) => {
    const { scrollHeight, scrollTop, offsetHeight } = e.target as HTMLElement;

    const state = { 
      top: scrollTop,
      height: scrollHeight,
      containerHeight: offsetHeight,
      offsetBottom: (scrollHeight - scrollTop) - offsetHeight
    };

    console.log(state)

    if(onScroll) {
      onScroll(state);
    };
  }, []);

  return (
    <div className={className} style={{ overflowY: "scroll" }} onScroll={handleScroll}>
      {children}
    </div>
  )
}

function EmptyState() {
  return (
    <></>
  )
}

export default DashboardTransactionsTable;