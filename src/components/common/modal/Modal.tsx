import { MutableRefObject, ReactNode } from "react";
import styles from "./Modal.module.scss";
import { stylesClassNames } from "@/lib/common/classNames";

const classNames = stylesClassNames(styles);

const containerClassName = classNames("container");

export default function Modal({ children, dialogRef }: { children?: ReactNode, dialogRef: MutableRefObject<HTMLDialogElement | null> }) {
    return (
        <dialog className={containerClassName} ref={dialogRef}>
            {children}
        </dialog>
    )
}