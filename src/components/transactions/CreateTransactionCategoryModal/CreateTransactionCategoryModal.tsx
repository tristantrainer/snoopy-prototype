"use client"

import { useRef } from "react";

import styles from "./CreateTransactionCategoryModal.module.scss";
import { stylesClassNames } from "@/lib/common/classNames";
import Modal from "@/components/common/modal/Modal";
import { Form } from "../../common/form/Form";
import { useCreateTransactionCategoryMutation } from "@/lib/woodstock/client/mutations/useCreateTransactionCategoryMutation";
import { z } from 'zod';

const CreateTransactionCategorySchema = z.object({
	name: z.string(),
});

type CreateTransactionType = z.infer<typeof CreateTransactionCategorySchema>;

const classNames = stylesClassNames(styles);

function CreateTransactionCategoryModal() {
	const dialogRef = useRef<HTMLDialogElement | null>(null);
	const createTransactionCategory = useCreateTransactionCategoryMutation();

	const handleSubmit = (data: CreateTransactionType, reset: () => void) => {
		createTransactionCategory(data);
		reset();
		dialogRef.current?.close();
	}

	const openModal = () => dialogRef.current?.showModal();

	return (
		<>
			<div className={classNames("add-btn")} onClick={openModal}>Add Transaction Category</div>
			<Modal dialogRef={dialogRef}>
				<Form onSubmit={handleSubmit} schema={CreateTransactionCategorySchema} className={classNames("form")}>
					<Form.Label 
						className={classNames("label")}
						label="Name"
					/>
					<Form.Input 
						className={classNames("input")}
						name="name" 
						placeholder="Enter name"
					/>
					<button>Submit</button>
				</Form>
			</Modal>
		</>
	)
}

export default CreateTransactionCategoryModal;