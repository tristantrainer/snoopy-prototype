import styles from './AddButton.module.scss';

export type AddButtonPropsType = {
  onClick?: () => void,
  className?: string,
  type?: "button" | "submit" | "reset",
  label?: string,
}

function AddButton({ onClick, className, type, label }: AddButtonPropsType) {
  return (
    <button 
      onClick={onClick}
      className={`${className} ${styles['button']}`}
      type={type}
    >
      <span className={styles['icon']}>+</span>
      <span className={styles['label']}>{label ?? "Add"}</span>
    </button>
  );
};

export default AddButton;