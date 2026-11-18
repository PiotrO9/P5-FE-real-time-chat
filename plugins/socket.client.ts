import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';

export default defineNuxtPlugin(() => {
    const config = useRuntimeConfig();

    const socketUrl = config.public.socketUrl || 'http://localhost:3000';

    const socket: Socket = io(socketUrl, {
        autoConnect: false,
        transports: import.meta.dev ? ['websocket', 'polling'] : ['websocket'],
        withCredentials: true,
    });

    socket.on('connect_error', (error) => {
        console.error('WebSocket connection error:', error.message);
    });

    return {
        provide: {
            socket,
        },
    };
});
