export type Account = {
    id: string,
    name: string,
    balance: number,
    category: AccountCategory
}

export type AccountCategory = {
  name: string,
  id: string,
}

export type Transaction = {
    id: string,
    description: string,
    value: number,
    date: string,
    category: TransactionCategory,
}

export type TransactionCategory = {
  id: string,
  name: string,
}
