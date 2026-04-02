import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'info';

export type Toast = {
	id: number;
	type: ToastType;
	message: string;
};

let _nextId = 0;

const { subscribe, update } = writable<Toast[]>([]);

function add(type: ToastType, message: string) {
	const id = _nextId++;
	update((toasts) => [...toasts, { id, type, message }]);
	setTimeout(() => remove(id), 5000);
}

function remove(id: number) {
	update((toasts) => toasts.filter((t) => t.id !== id));
}

export const toast = {
	subscribe,
	success: (message: string) => add('success', message),
	error:   (message: string) => add('error', message),
	info:    (message: string) => add('info', message),
	remove,
};
