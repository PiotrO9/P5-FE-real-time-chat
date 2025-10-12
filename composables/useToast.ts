export interface Toast {
	id: string
	message: string
	type: 'success' | 'error' | 'info' | 'warning'
	duration?: number
}

export function useToast() {
	const toasts = useState<Toast[]>('toasts', () => [])

	function addToast(
		message: string,
		type: Toast['type'] = 'info',
		duration: number = 5000
	): void {
		const id = `toast-${Date.now()}-${Math.random()}`

		toasts.value.push({
			id,
			message,
			type,
			duration
		})

		if (duration > 0) {
			setTimeout(() => {
				removeToast(id)
			}, duration)
		}
	}

	function removeToast(id: string): void {
		toasts.value = toasts.value.filter((toast) => toast.id !== id)
	}

	function success(message: string, duration?: number): void {
		addToast(message, 'success', duration)
	}

	function error(message: string, duration?: number): void {
		addToast(message, 'error', duration)
	}

	function info(message: string, duration?: number): void {
		addToast(message, 'info', duration)
	}

	function warning(message: string, duration?: number): void {
		addToast(message, 'warning', duration)
	}

	function clear(): void {
		toasts.value = []
	}

	return {
		toasts: readonly(toasts),
		addToast,
		removeToast,
		success,
		error,
		info,
		warning,
		clear
	}
}
