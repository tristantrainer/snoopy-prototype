"use client";

import styles from "./TransactionsList.module.scss";
import { stylesClassNames } from "@/lib/common/classNames";
import { Transaction } from "@/lib/woodstock/client/types";
import { useGetTransactionsQuery } from "@/lib/woodstock/client/queries/useGetTransactionsQuery";
import { ChangeEvent, useState } from "react";
import { useDebounce } from "@/lib/common/debounce";

const classNames = stylesClassNames(styles);

function TransactionsList() {
	const { transactions, loading, error, hasNextPage, loadNextPage, filter } = useGetTransactionsQuery({ pageSize: 10, cursor: null, where: null });

	const handleSearch = (search: string) => {
		if(search.length >= 3) {
			filter({ description: { contains: search }});
		} else {
			filter({ description: { contains: "" }});
		}
	};

	if(loading || error || !transactions)
		return <div>Not loaded...</div>

	return (
		<div className={classNames("container")}>
			<div>
				<SearchField onChange={handleSearch} />
			</div>
			<div className={classNames("table")}>
				<div className={classNames("header")}>
					<div className={classNames("cell")}>Description</div>
					<div className={classNames("cell")}>Category</div>
					<div className={classNames("cell")}>Date</div>
					<div className={classNames("cell")}>Value</div>
				</div>
				<ol className={classNames("list")}>
					{transactions?.map((transaction) => <TransactionsListRow key={transaction.id} transaction={transaction} />)}
				</ol>
			</div>
			{hasNextPage && <div onClick={loadNextPage}>Load More</div>}
		</div>
	);
}

function TransactionsListRow({ transaction }: { transaction: Transaction }) {
	return (
		<li className={classNames("row")}>
			<div className={classNames("columns")}>
				<div className={classNames("cell")}>{transaction.description}</div>
				<div className={classNames("cell")}>{transaction.category.name}</div>
				<div className={classNames("cell")}>{dateFormatter(transaction.date)}</div>
				<div className={classNames("cell")}>{transaction.value}</div>
			</div>
		</li>
	);
}

function dateFormatter(dateString: string) {
	const date = new Date(dateString);

	return date.toLocaleDateString('en-uk', { weekday:"long", year:"numeric", month:"short", day:"numeric"})
}

function SearchField({ onChange }: { onChange: (value: string) => void}) {
	const [value, setValue] = useState("");

  const debouncedRequest = useDebounce(() => {
	onChange(value);
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setValue(value);

    debouncedRequest();
  };

	return (
		<input onChange={handleChange} value={value}/>
	)
}

export default TransactionsList;