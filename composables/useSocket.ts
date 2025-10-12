import type { Socket } from 'socket.io-client'

export function useSocket() {
	const { $socket } = useNuxtApp()
	const socket = $socket as Socket

	function connect(): void {
		if (!socket.connected) {
			socket.connect()
		}
	}

	function disconnect(): void {
		if (socket.connected) {
			socket.disconnect()
		}
	}

	function emit(event: string, data?: any): void {
		socket.emit(event, data)
	}

	function on(event: string, callback: (...args: any[]) => void): void {
		socket.on(event, callback)
	}

	function off(event: string, callback?: (...args: any[]) => void): void {
		if (callback) {
			socket.off(event, callback)
		} else {
			socket.off(event)
		}
	}

	return {
		socket,
		connect,
		disconnect,
		emit,
		on,
		off,
		isConnected: computed(() => socket.connected)
	}
}
