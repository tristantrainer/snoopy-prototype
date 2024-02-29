import styles from './dashboard.module.scss';
import { stylesClassNames } from "@/lib/common/classNames";
import DashboardTransactionsCard from "@/components/dashboard/transactions/card/DashboardTransactionsCard";

const classNames = stylesClassNames(styles);

export default function Home() {
    return (
      <div className={classNames("dashboard-grid")}>
        {/* <DashboardTransactionsCard className={classNames("transactions")} /> */}
      </div>
    )
  }
  