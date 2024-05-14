import styles from './dashboard.module.scss';
import { stylesClassNames } from "@/lib/common/classNames";
import DashboardTransactionsCard from "@/components/dashboard/transactions/card/DashboardTransactionsCard";

const classNames = stylesClassNames(styles);

export default function Home() {
    return (
      <div className={classNames("dashboard-grid")}>
        <div className={classNames("center-content statistics-card")}>
          <label>Statistics PlaceHolder</label>
        </div>

        <div className={classNames("center-content upcoming-bills-card")}>
          <label>Upcoming Bills PlaceHolder</label>
        </div>

        <div className={classNames("center-content my-savings-card")}>
          <label>My Savings PlaceHolder</label>
        </div>

        <div className={classNames("center-content accounts-card")}>
          <label>Accounts PlaceHolder</label>
        </div>

        <div className={classNames("center-content transactions-card")}>
          <div className={classNames("transactions-table")}>
            <div className={classNames("center-content title")}>Transactions History</div>
            <div className={classNames("center-content search")}>Search</div>
            <div className={classNames("center-content filter")}>Filter</div>
            <div className={classNames("center-content items")}>
              Table Items
            </div>
          </div>
        </div>
      </div>
    )
  }
  