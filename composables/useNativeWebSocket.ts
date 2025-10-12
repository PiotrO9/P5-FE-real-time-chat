import { useWebSocket } from '@vueuse/core'

export function useNativeWebSocket(url: string) {
	const { status, data, send, open, close } = useWebSocket(url, {
		autoReconnect: {
			retries: 3,
			delay: 1000,
			onFailed() {
				console.error('Nie udało się połączyć z WebSocket po 3 próbach')
			}
		},
		heartbeat: {
			message: 'ping',
			interval: 30000
		}
	})

	function sendMessage(message: any): void {
		const payload = typeof message === 'string' ? message : JSON.stringify(message)
		send(payload)
	}

	return {
		status,
		data,
		send: sendMessage,
		open,
		close,
		isConnected: computed(() => status.value === 'OPEN')
	}
}
