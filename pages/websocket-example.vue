<script setup lang="ts">
// Socket.IO
const { connect, disconnect, emit, on, off, isConnected } = useSocket()
const message = ref<string>('')
const messages = ref<string[]>([])

// Native WebSocket
const wsUrl = ref<string>('ws://localhost:8080')
let ws: ReturnType<typeof useNativeWebSocket> | null = null
const wsStatus = ref<string>('CLOSED')
const wsData = ref<string>('')

// Socket.IO handlers
function handleConnect(): void {
	connect()
}

function handleDisconnect(): void {
	disconnect()
}

function handleSendMessage(): void {
	if (!message.value.trim()) return

	emit('message', { text: message.value })
	messages.value.push(`Wysłano: ${message.value}`)
	message.value = ''
}

// Native WebSocket handlers
function handleWsConnect(): void {
	if (!wsUrl.value) return

	ws = useNativeWebSocket(wsUrl.value)

	watch(
		() => ws?.status.value,
		(newStatus) => {
			wsStatus.value = newStatus || 'CLOSED'
		}
	)

	watch(
		() => ws?.data.value,
		(newData) => {
			wsData.value = newData || ''
		}
	)
}

function handleWsClose(): void {
	if (ws) {
		ws.close()
	}
}

// Setup Socket.IO listeners
onMounted(() => {
	on('message', (data: any) => {
		messages.value.push(`Otrzymano: ${JSON.stringify(data)}`)
	})

	on('error', (error: any) => {
		messages.value.push(`Błąd: ${error.message || error}`)
	})
})

// Cleanup
onUnmounted(() => {
	off('message')
	off('error')
	disconnect()

	if (ws) {
		ws.close()
	}
})
</script>

<template>
	<div class="min-h-screen bg-gray-50 py-12 px-4">
		<div class="max-w-4xl mx-auto">
			<h1 class="text-3xl font-bold text-gray-900 mb-8">WebSocket - Przykłady użycia</h1>

			<!-- Socket.IO Example -->
			<div class="bg-white rounded-lg shadow-md p-6 mb-8">
				<h2 class="text-2xl font-semibold text-gray-800 mb-4">1. Socket.IO Client</h2>

				<div class="mb-4">
					<p class="text-sm text-gray-600 mb-2">
						Status:
						<span
							:class="isConnected ? 'text-green-600' : 'text-red-600'"
							class="font-semibold"
						>
							{{ isConnected ? 'Połączony' : 'Rozłączony' }}
						</span>
					</p>
				</div>

				<div class="flex gap-2 mb-4">
					<button
						:disabled="isConnected"
						class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
						tabindex="0"
						aria-label="Połącz z WebSocket"
						@click="handleConnect"
						@keydown.enter="handleConnect"
					>
						Połącz
					</button>

					<button
						:disabled="!isConnected"
						class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
						tabindex="0"
						aria-label="Rozłącz WebSocket"
						@click="handleDisconnect"
						@keydown.enter="handleDisconnect"
					>
						Rozłącz
					</button>
				</div>

				<div class="mb-4">
					<input
						v-model="message"
						type="text"
						placeholder="Wpisz wiadomość..."
						class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
						@keydown.enter="handleSendMessage"
					/>
				</div>

				<button
					:disabled="!isConnected || !message"
					class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
					tabindex="0"
					aria-label="Wyślij wiadomość"
					@click="handleSendMessage"
					@keydown.enter="handleSendMessage"
				>
					Wyślij wiadomość
				</button>

				<div class="mt-6">
					<h3 class="text-lg font-semibold text-gray-700 mb-2">Otrzymane wiadomości:</h3>
					<div class="bg-gray-100 rounded p-4 max-h-64 overflow-y-auto">
						<div
							v-for="(msg, index) in messages"
							:key="index"
							class="mb-2 text-sm text-gray-700"
						>
							{{ msg }}
						</div>
						<div v-if="messages.length === 0" class="text-gray-500 text-sm">
							Brak wiadomości
						</div>
					</div>
				</div>
			</div>

			<!-- Native WebSocket Example -->
			<div class="bg-white rounded-lg shadow-md p-6">
				<h2 class="text-2xl font-semibold text-gray-800 mb-4">
					2. Native WebSocket (VueUse)
				</h2>

				<div class="mb-4">
					<p class="text-sm text-gray-600 mb-2">
						Status:
						<span
							:class="wsStatus === 'OPEN' ? 'text-green-600' : 'text-red-600'"
							class="font-semibold"
						>
							{{ wsStatus }}
						</span>
					</p>
				</div>

				<div class="mb-4">
					<input
						v-model="wsUrl"
						type="text"
						placeholder="ws://localhost:8080"
						class="w-full px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
					/>
				</div>

				<div class="flex gap-2 mb-4">
					<button
						:disabled="wsStatus === 'OPEN'"
						class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
						tabindex="0"
						aria-label="Połącz z native WebSocket"
						@click="handleWsConnect"
						@keydown.enter="handleWsConnect"
					>
						Połącz
					</button>

					<button
						:disabled="wsStatus !== 'OPEN'"
						class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
						tabindex="0"
						aria-label="Zamknij native WebSocket"
						@click="handleWsClose"
						@keydown.enter="handleWsClose"
					>
						Zamknij
					</button>
				</div>

				<div class="mt-4">
					<h3 class="text-lg font-semibold text-gray-700 mb-2">Ostatnia wiadomość:</h3>
					<div class="bg-gray-100 rounded p-4">
						<p class="text-sm text-gray-700">
							{{ wsData || 'Brak danych' }}
						</p>
					</div>
				</div>
			</div>

			<!-- Documentation -->
			<div class="mt-8 bg-blue-50 rounded-lg p-6">
				<h3 class="text-lg font-semibold text-blue-900 mb-3">📚 Dokumentacja</h3>
				<ul class="space-y-2 text-sm text-blue-800">
					<li>
						• Socket.IO Client:
						<a
							href="https://socket.io/docs/v4/client-api/"
							target="_blank"
							class="underline hover:text-blue-600"
						>
							Dokumentacja
						</a>
					</li>
					<li>
						• VueUse WebSocket:
						<a
							href="https://vueuse.org/core/useWebSocket/"
							target="_blank"
							class="underline hover:text-blue-600"
						>
							Dokumentacja
						</a>
					</li>
				</ul>
			</div>
		</div>
	</div>
</template>

<style scoped></style>
