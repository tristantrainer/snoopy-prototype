import { useEffect, useMemo, useRef } from "react";

function debounce(callback: Function, ms: number = 0) {
	let timeoutId: number;

	return () => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(callback, ms);
	}
}

export function useDebounce(callback: Function, ms: number = 500) {
	const ref = useRef<Function>();

	useEffect(() => {
		ref.current = callback;
	}, [callback]);

	const debouncedCallback = useMemo(() => {
		const func = () => {
			ref.current?.();
		};

		return debounce(func, ms);
	}, []);

	return debouncedCallback;
};