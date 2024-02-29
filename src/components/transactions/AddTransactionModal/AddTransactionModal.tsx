"use client"

import { useRef } from "react";

import styles from "./AddTransactionModal.module.scss";
import { stylesClassNames } from "@/lib/common/classNames";
import Modal from "@/components/common/modal/Modal";
import { Form } from "../../common/form/Form";
import { useCreateTransactionMutation } from "@/lib/woodstock/client/mutations/useCreateTransactionMutation";
import { z } from 'zod';
import { useGetTransactionCategoriesQuery } from "@/lib/woodstock/client/queries/useGetTransactionCategoriesQuery";
import AddButton from "@/components/common/buttons/add/AddButton";

const CreateTransactionSchema = z.object({
	description: z.string(),
	date: z.string().transform((date) => new Date(date).toISOString()),
	value: z.coerce.number(),
	categoryId: z.string().uuid(),
});

type CreateTransactionType = z.infer<typeof CreateTransactionSchema>;

const classNames = stylesClassNames(styles);

function AddTransactionModal() {
	const dialogRef = useRef<HTMLDialogElement | null>(null);
	const { transactionCategories, loading, error } = useGetTransactionCategoriesQuery();
	const createTransaction = useCreateTransactionMutation();

	const handleSubmit = (data: CreateTransactionType, reset: () => void) => {
		createTransaction(data);
		reset();
		dialogRef.current?.close();
	}

	const openModal = () => dialogRef.current?.showModal();

	if(loading || error || !transactionCategories) 
		return <div>Loading..</div>

	return (
		<>
			<AddButton className={classNames("add-btn")} onClick={openModal} label="Add Transaction"/>
			<Modal dialogRef={dialogRef}>
				<Form onSubmit={handleSubmit} schema={CreateTransactionSchema} className={classNames("form")}>
					<Form.Label 
						className={classNames("label")}
						label="Description"
					/>
					<Form.Input 
						className={classNames("input")}
						name="description" 
						placeholder="Enter description"
					/>
					<Form.Label 
						className={classNames("label")}
						label="Date"
					/>
					<Form.Input 
						className={classNames("input")}
						name="date"
						type="date"
					/>
					<Form.Label 
						className={classNames("label")}
						label="Value"
					/>
					<Form.Input 
						className={classNames("input")}
						name="value" 
						placeholder="Enter value"
					/>
					<Form.Label 
						className={classNames("label")}
						label="Category"
					/>
					<Form.Select 
						classNames={{
							container: classNames("custom-select"),
							select: classNames("select"),
							option: classNames("option")
						}}
						options={transactionCategories}
						name="categoryId"
						keySelector={(data) => data.id}
						valueSelector={(data) => data.id}
						labelSelector={(data) => data.name}
					/>
					<button type="submit">Submit</button>
				</Form>
			</Modal>
		</>
	)
}


export default AddTransactionModal;