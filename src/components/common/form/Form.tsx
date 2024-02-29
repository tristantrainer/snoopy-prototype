"use client";

import { ReactNode, createContext, useContext } from "react";
import styles from "./Form.module.scss";
import { stylesClassNames } from "@/lib/common/classNames";
import { FieldValues, FormState, UseFormRegister, useForm } from "react-hook-form";
import { ZodSchema } from 'zod';
import { zodResolver } from "@hookform/resolvers/zod";

const classNames = stylesClassNames(styles);

type FormPropsType<T> = {
	className?: string, 
	children: ReactNode, 
	onSubmit: (data: T, reset: () => void) => void,
	schema: ZodSchema<T>
}

type FormInputProps = {
    className?: string,
	name: string,
	type?: string,
    placeholder?: string,
	defaultValue?: string,
}

const FormContext = createContext<{ register: UseFormRegister<any>, formState: FormState<FieldValues> } | null>(null);

function useFormContext() {
	const context = useContext(FormContext);

	if(!context)
		throw Error("Form context not found in parents of form");

	return context;
}

function Form<T extends FieldValues, TSchema extends ZodSchema<T>>({ className, children, schema, onSubmit }: FormPropsType<T>) {
	const { 
		register,
		handleSubmit,
		formState,
		reset,
	} = useForm<T>({
		resolver: zodResolver(schema)
	});

	console.log(formState)

	const submitHandler = (data: T) => {
		onSubmit(data, () => reset());
	}

	return (
		<FormContext.Provider value={{ register, formState }}>
			<form className={`${classNames("form")} ${className}`} onSubmit={handleSubmit(submitHandler)}>
				{children}
			</form>
		</FormContext.Provider>
	)
}

function FormInput({ className, name, type, placeholder, defaultValue }: FormInputProps) {
	const { register, formState: { errors } } = useFormContext();

	return (
		<>
			<input {...register(name)} defaultValue={defaultValue} className={className} type={type} placeholder={placeholder} />
			{errors[name] && <p>{`${errors[name]?.message}`}</p>}
		</>
	);
}

function FormLabel({ label, className }: { label: string, className: string }) {
    return (
        <label className={className}>{label}</label>
    );
}

type FormSelectProps<T> = {
	classNames?: FormSelectClassNames,
	name: string,
	options: T[],
    keySelector: (data: T) => string,
    labelSelector: (data: T) => string,
    valueSelector: (data: T) => string | number,
}

type FormSelectClassNames = {
    container?: string,
    select?: string,
    option?: string,
}

function FormSelect<T>({ classNames, name, options, valueSelector, labelSelector, keySelector }: FormSelectProps<T>) {
	const { register } = useFormContext();

	return (
        <div className={classNames?.container}>
            <select {...register(name)} className={classNames?.select}>
                {options.map((option) => <option className={classNames?.option} key={keySelector(option)} label={labelSelector(option)} value={valueSelector(option)} />)}
            </select>
        </div>
	);
}

function FormError({ name }: { name: string}) {
	const { formState: { errors } } = useFormContext();

    return (
        errors[name] && <p>{`${errors[name]?.message}`}</p>
    );
}

Form.Input = FormInput;
Form.Select = FormSelect;
Form.Error = FormError;
Form.Label = FormLabel;

export { Form };