"use client";

import { GetAccountsVariablesType, useGetAccountsQuery } from "@/lib/woodstock/client/queries/useGetAccountsQuery";
import styles from "./AccountsList.module.scss";
import { stylesClassNames } from "@/lib/common/classNames";
import { Account } from "@/lib/woodstock/models/Account";

const classNames = stylesClassNames(styles);

function AccountsList() {
    const { accounts, loading, error, hasNextPage, loadNextPage } = useGetAccountsQuery({ pageSize: 2, cursor: null });

    if(loading || error || !accounts)
        return <div>Not loaded...</div>

    return (
        <div className={classNames("container")}>
            <div className={classNames("table")}>
                <div className={classNames("header")}>
                    <div className={classNames("cell")}>Name</div>
                    <div className={classNames("cell")}>Category</div>
                    <div className={classNames("cell")}>Balance</div>
                </div>
                <ol className={classNames("list")}>
                    {accounts?.map((account) => <AccountsListRow key={account.id} account={account} />)}
                </ol>
            </div>
            {hasNextPage && <div onClick={loadNextPage}>Load More</div>}
        </div>
    );
}

function AccountsListPage({ pageInfo }: { pageInfo: GetAccountsVariablesType }) {
    return (
        <div>

        </div>
    );
}

function AccountsListRow({ account }: { account: Account }) {
    return (
        <li className={classNames("row")}>
            <div className={classNames("columns")}>
                <div className={classNames("cell")}>{account.name}</div>
                <div className={classNames("cell")}>{account.category.name}</div>
                <div className={classNames("cell")}>{account.balance}</div>
            </div>
            
        </li>
    );
}

export default AccountsList;