import { ReactNode, UIEventHandler, useCallback, useMemo} from 'react';
import styles from './Table.module.scss';
import { stylesClassNames } from '@/lib/common/classNames';

const classNames = stylesClassNames(styles);

type ClassNameAndChildrenProps = {
  children?: ReactNode,
  className?: string
}

type TableProps = ClassNameAndChildrenProps;

type TableBodyProps<T> = {
  children: (row: T) => ReactNode,
  data?: T[],
  className?: string,
  emptyState?: () => ReactNode,
}

function Table({ children, className }: TableProps) {
  return (
    <table className={className}>
      {children}
    </table>
  );
}

function TableBody<T>({ children, data, className, emptyState }: TableBodyProps<T>) {
  return (
    <tbody className={className}>
      {data ? data.map(children) : (emptyState ? emptyState() : null)}
    </tbody>
  )
}

function TableRow({ children, className }: ClassNameAndChildrenProps) {
  return (
    <tr className={className}>
      {children}
    </tr>
  );
}

function TableCell({ children, className }: ClassNameAndChildrenProps) {
  return (
    <td className={className}>
      {children}
    </td>
  )
}

function TableHeader({ children, className }: ClassNameAndChildrenProps) {
  return (
    <thead className={className}>
      <tr>
       {children}
      </tr>
    </thead>
  )
}

function TableLabel({ children, className }: ClassNameAndChildrenProps) {
  return (
    <th className={className}>
      {children}
    </th>
  )
}

Table.Header = TableHeader;
Table.Label = TableLabel;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;

export default Table;

// export type TablePropsType<T> = {
//   onClick?: () => void,
//   classes?: {
//     container?: string,
//     table?: string,
//     label?: string,
//     header?: string,
//   },
//   type?: "button" | "submit" | "reset",
//   label?: string,
//   columns: TableColumn<T>[],
//   items: T[],
//   children?: ReactNode,
// }

// type TableColumn<T> = {
//   label: string,
//   valueSelector: (item: T) => string | number,
// }



// function Table<T>({ classes, children, columns }: TablePropsType<T>) {
//   return (
//     <div className={classNames(classes?.container)}>
//       <table className={classNames(classes?.table)}>
//         <thead>
//           <tr>
//             {columns.map((column) => <th>{column.label}</th>)}
//           </tr>
//         </thead>
//         {children}
//       </table>
//     </div>
//   );
// };

// type TableHeaderChildren = ReactNode;

// function TableHeader({ className, children }: { className?: string, children: TableHeaderChildren }) {
//   return (
//     <thead className={className}>
//       <tr>
//         {children}
//       </tr>
//     </thead>
//   );
// }

// function TableColumnLabel({ className, value }: { className?: string, value: string | number }) {
//   return (
//     <td className={className}>
//       {value}
//     </td>
//   );
// }

// function TableBody({ className, children }: { className?: string, children: ReactNode }) {
//   return (
//     <tbody className={className}>
//       {children}
//     </tbody>
//   )
// }

// function TableRow({ className, children }: { className?: string, children: ReactNode }) {
//   return (
//     <tr className={className}>
//       {children}
//     </tr>
//   );
// }

// function TableCell({ className, value }: { className?: string, value: string | number }) {
//   return (
//     <td className={className}>
//       {value}
//     </td>
//   );
// }

// Table.Body = TableBody;
// Table.Row = TableRow;
// Table.Cell = TableCell;
// Table.Header = TableHeader;
// Table.Label = TableColumnLabel;

// export default Table;