export type Account = {
    id: string,
    name: string,
		balance: number,
    category: {
      name: string,
      id: string,
    }
}