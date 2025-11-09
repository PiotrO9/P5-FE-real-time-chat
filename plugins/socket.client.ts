import type { Socket } from 'socket.io-client'
import { io } from 'socket.io-client'

export default defineNuxtPlugin(() => {
	const config = useRuntimeConfig()

	const socketUrl = config.public.socketUrl || 'http://localhost:3000'

	function getTokenFromCookies(): string | null {
		if (typeof document === 'undefined') return null

		const cookies = document.cookie.split('; ')
		const tokenCookie = cookies.find((row) => row.startsWith('accessToken='))
		return tokenCookie ? tokenCookie.split('=')[1] : null
	}

	const socket: Socket = io(socketUrl, {
		autoConnect: false,
		transports: ['websocket', 'polling'],
		withCredentials: true,
		auth: (cb) => {
			const token = getTokenFromCookies()
			cb({ token: token || undefined })
		}
	})

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
