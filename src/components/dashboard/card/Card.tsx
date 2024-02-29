import { ReactNode } from 'react';
import styles from './Card.module.scss';
import { stylesClassNames } from '@/lib/common/classNames';

const classNames = stylesClassNames(styles);

export type CardPropsType = {
  className?: string,
  children?: ReactNode,
}

function Card({ className, children }: CardPropsType) {
  return (
    <div className={classNames(className, "container")}>
      {children}
    </div>
  );
};

export type CardHeaderPropsType = {
  className?: string,
  title?: string,
  children?: ReactNode,
}

function CardHeader({ className, title, children }: CardHeaderPropsType) {
  return (
    <div className={classNames(className, "header-container")}>
      <h2 className={classNames("header-title")}>{title}</h2>
      <div className={classNames("header-items")}>
        {children}
      </div>
    </div>
  )
}

export type CardContentPropsType = {
  className?: string,
  children?: ReactNode,
}

function CardContent({ className, children }: CardHeaderPropsType) {
  return (
    <div className={classNames(className, "content-container")}>
      {children}
    </div>
  )
}

Card.Header = CardHeader;
Card.Content = CardContent;

export default Card;