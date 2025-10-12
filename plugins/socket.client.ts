import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig()

	// Ustaw adres swojego backendu WebSocket
	const socketUrl = config.public.socketUrl || 'http://localhost:3000'

	const socket: Socket = io(socketUrl, {
		autoConnect: false, // Ręczne połączenie
		transports: ['websocket', 'polling']
	})

	// Event handlers
	socket.on('connect', () => {
		console.log('WebSocket połączony:', socket.id)
	})

	socket.on('disconnect', () => {
		console.log('WebSocket rozłączony')
	})

	socket.on('connect_error', (error) => {
		console.error('Błąd połączenia WebSocket:', error.message)
	})

	return {
		provide: {
			socket
		}
	}
})
