<script setup lang="ts">
import ChatList from '~/components/pages/dashboard/ChatList.vue'
import ChatPanel from '~/components/pages/dashboard/ChatPanel.vue'
import MessageForm from '~/components/pages/dashboard/MessageForm.vue'
import type { Chat, Message } from '~/types/Chat'
import {
	fetchChats as fetchChatsFromService,
	fetchMessages as fetchMessagesFromService,
	sendMessage as sendMessageToService
} from '~/services/chatService'
import type { ApiResponse } from '~/types/Api'
import type { ChatsResponse } from '~/types/ChatsApi'

// using ApiResponse from types/Api

const { error: toastError } = useToast()

const currentUserId = 0

const searchQuery = ref('')
const selectedChatId = ref<number | null>(null)
const newMessageText = ref('')
const chatPanelRef = ref<any>(null)

const chats = ref<Chat[]>([])
const chatsLoading = ref(false)
const chatsError = ref<string | null>(null)

const messagesState = reactive<
	Record<
		number,
		{ limit: number; offset: number; loading: boolean; error: string | null; hasMore: boolean }
	>
>({})

onMounted(async () => {
	await fetchChats()
	if (selectedChatId.value !== null) return
	const firstChat = chats.value.at(0)
	if (!firstChat) return
	selectedChatId.value = firstChat.id
	await fetchMessages(firstChat.id, false)
	nextTick(() => handleScrollToBottom())
})

const filteredChats = computed(() => {
	const query = searchQuery.value.trim().toLowerCase()
	if (query.length === 0) return chats.value
	return chats.value.filter((c) => c.name.toLowerCase().includes(query))
})

const selectedChat = computed<Chat | null>(() => {
	if (selectedChatId.value === null) return null
	return chats.value.find((c) => c.id === selectedChatId.value) ?? null
})

async function fetchChats() {
	try {
		chatsLoading.value = true
		chatsError.value = null
		const res = (await fetchChatsFromService()) as ApiResponse<ChatsResponse>
		const raw = res?.data
		const list: any[] = Array.isArray(raw?.chats) ? raw.chats : []
		chats.value = list.map((c) => ({
			...c,
			name: String(c?.name ?? c?.title ?? 'Czat'),
			lastMessage: String(c?.lastMessage ?? ''),
			unreadCount: Number.isFinite(c?.unreadCount) ? Number(c.unreadCount) : 0,
			messages: Array.isArray(c?.messages) ? c.messages : []
		}))
	} catch (err: any) {
		chatsError.value = err?.message || 'Nie udało się pobrać listy czatów'
		toastError(chatsError.value || 'Błąd')
	} finally {
		chatsLoading.value = false
	}
}

function ensureChatState(chatId: number) {
	if (messagesState[chatId]) return
	messagesState[chatId] = { limit: 50, offset: 0, loading: false, error: null, hasMore: true }
}

function getChatState(chatId: number) {
	ensureChatState(chatId)
	return messagesState[chatId] as {
		limit: number
		offset: number
		loading: boolean
		error: string | null
		hasMore: boolean
	}
}

async function fetchMessages(chatId: number, append: boolean) {
	const state = getChatState(chatId)

	if (state.loading) return

	try {
		state.loading = true
		state.error = null
		const res = await fetchMessagesFromService(chatId, state.limit, state.offset)

		const raw = res?.data
		const items: any[] = Array.isArray(raw)
			? raw
			: Array.isArray(raw?.items)
				? raw.items
				: Array.isArray(raw?.messages)
					? raw.messages
					: []
		const chat = chats.value.find((c) => c.id === chatId)
		if (!chat) return
		if (append) {
			chat.messages = [...chat.messages, ...items]
		} else {
			chat.messages = items
		}
		state.offset = chat.messages.length
		state.hasMore = items.length >= state.limit
		if (items.length > 0) {
			chat.lastMessage = items[items.length - 1]?.content || chat.lastMessage
		}
	} catch (err: any) {
		state.error = err?.message || 'Nie udało się pobrać wiadomości'
		toastError(state.error || 'Błąd')
	} finally {
		state.loading = false
	}
}

function handleSelectChat(chatId: number) {
	if (selectedChatId.value === chatId) return
	selectedChatId.value = chatId
	const chat = chats.value.find((c) => c.id === chatId)
	if (chat) chat.unreadCount = 0
	fetchMessages(chatId, false)
	nextTick(() => handleScrollToBottom())
}

async function handleSendMessage() {
	const chat = selectedChat.value
	if (!chat) return
	const text = newMessageText.value.trim()
	if (text.length === 0) return
	try {
		const res = await sendMessageToService(chat.id, text)
		const saved = res.data as unknown as Message
		chat.messages.push(saved)
		chat.lastMessage = saved.content
		newMessageText.value = ''
		nextTick(() => handleScrollToBottom())
	} catch (err: any) {
		toastError(err?.message || 'Nie udało się wysłać wiadomości')
	}
}

function handleLoadMore() {
	const chatId = selectedChatId.value
	if (chatId === null) return
	const state = getChatState(chatId)
	if (!state.hasMore) return
	fetchMessages(chatId, true)
}

function handleScrollToBottom() {
	chatPanelRef.value?.scrollToBottom?.()
}
</script>

<template>
	<div class="h-screen w-screen bg-slate-50">
		<div class="h-full w-full">
			<div class="h-full flex bg-white">
				<aside class="w-full md:w-96 border-r border-gray-200 flex flex-col">
					<div
						class="p-4 border-b border-gray-200 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60"
					>
						<h1 class="text-xl font-semibold text-slate-900">Wiadomości</h1>
						<label for="chat-search" class="sr-only">Szukaj czatu</label>
						<input
							id="chat-search"
							v-model="searchQuery"
							type="text"
							placeholder="Szukaj..."
							class="mt-3 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						/>
					</div>
					<div v-if="chatsLoading" class="p-4 text-sm text-slate-600">
						Ładowanie czatów...
					</div>
					<div v-else-if="chatsError" class="p-4 text-sm text-red-600">
						{{ chatsError }}
					</div>
					<ChatList
						v-else
						:chats="filteredChats"
						:selected-chat-id="selectedChatId"
						@select-chat="handleSelectChat"
					/>
				</aside>

				<div class="flex flex-col w-full">
					<ChatPanel
						ref="chatPanelRef"
						:selected-chat="selectedChat"
						:current-user-id="currentUserId"
						:can-load-more="
							selectedChat ? messagesState[selectedChat.id]?.hasMore : false
						"
						:is-loading-more="
							selectedChat ? messagesState[selectedChat.id]?.loading : false
						"
						@load-more="handleLoadMore"
					/>
					<template v-if="selectedChat">
						<MessageForm v-model="newMessageText" @submit="handleSendMessage" />
					</template>
				</div>

				<section v-if="!selectedChat" class="md:hidden flex-1 flex flex-col">
					<div class="flex-1 flex items-center justify-center text-gray-500">
						Wybierz czat z listy po lewej
					</div>
				</section>
			</div>
		</div>
	</div>
</template>
