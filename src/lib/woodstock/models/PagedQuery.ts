import { PageInfo } from "../client/queries/usePagedQuery"

export type PagedQuery<T> = {
    nodes: T[],
    edges: PagedEdgeType<T>[],
    pageInfo: PageInfo
}

export type PagedEdgeType<T> = {
    cursor: string,
    node: T,
}