<script setup lang="ts">
import ChatList from '~/components/pages/dashboard/ChatList.vue'
import ChatPanel from '~/components/pages/dashboard/ChatPanel.vue'
import MessageForm from '~/components/pages/dashboard/MessageForm.vue'

type Message = {
	id: number
	chatId: number
	senderId: number
	senderName: string
	content: string
	createdAt: string
}

type Chat = {
	id: number
	name: string
	avatar?: string
	lastMessage: string
	unreadCount: number
	messages: Message[]
}

const currentUserId = 1

const searchQuery = ref('')
const selectedChatId = ref<number | null>(null)
const newMessageText = ref('')
const chatPanelRef = ref<any>(null)

const chats = ref<Chat[]>([
	{
		id: 101,
		name: 'Jan Kowalski',
		avatar: '',
		lastMessage: 'Jasne, widzimy się jutro!',
		unreadCount: 2,
		messages: [
			{
				id: 1,
				chatId: 101,
				senderId: 2,
				senderName: 'Jan Kowalski',
				content: 'Hej, pasuje Ci jutro?',
				createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
			},
			{
				id: 2,
				chatId: 101,
				senderId: 1,
				senderName: 'Ty',
				content: 'Tak, super.',
				createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
			},
			{
				id: 3,
				chatId: 101,
				senderId: 2,
				senderName: 'Jan Kowalski',
				content: 'Jasne, widzimy się jutro!',
				createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
			}
		]
	},
	{
		id: 102,
		name: 'Zespół Frontend',
		avatar: '',
		lastMessage: 'Wrzuć proszę PR do review.',
		unreadCount: 0,
		messages: [
			{
				id: 1,
				chatId: 102,
				senderId: 3,
				senderName: 'Anna',
				content: 'Pamiętaj o testach e2e.',
				createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
			},
			{
				id: 2,
				chatId: 102,
				senderId: 1,
				senderName: 'Ty',
				content: 'Ok, dorzucę dzisiaj.',
				createdAt: new Date(Date.now() - 1000 * 60 * 90).toISOString()
			},
			{
				id: 3,
				chatId: 102,
				senderId: 4,
				senderName: 'Marek',
				content: 'Wrzuć proszę PR do review.',
				createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
			}
		]
	},
	{
		id: 103,
		name: 'Kasia',
		avatar: '',
		lastMessage: 'Do zobaczenia!',
		unreadCount: 5,
		messages: [
			{
				id: 1,
				chatId: 103,
				senderId: 1,
				senderName: 'Ty',
				content: 'Dzięki za pomoc.',
				createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString()
			},
			{
				id: 2,
				chatId: 103,
				senderId: 5,
				senderName: 'Kasia',
				content: 'Nie ma sprawy. Do zobaczenia!',
				createdAt: new Date(Date.now() - 1000 * 60 * 200).toISOString()
			}
		]
	}
])

onMounted(() => {
	if (selectedChatId.value !== null) return
	const firstChat = chats.value.at(0)
	if (!firstChat) return
	selectedChatId.value = firstChat.id
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

function handleSelectChat(chatId: number) {
	if (selectedChatId.value === chatId) return
	selectedChatId.value = chatId
	const chat = chats.value.find((c) => c.id === chatId)
	if (chat) chat.unreadCount = 0
	nextTick(() => handleScrollToBottom())
}

function handleSendMessage() {
	const chat = selectedChat.value
	if (!chat) return
	const text = newMessageText.value.trim()
	if (text.length === 0) return
	const newId = (chat.messages.at(-1)?.id ?? 0) + 1
	const message: Message = {
		id: newId,
		chatId: chat.id,
		senderId: currentUserId,
		senderName: 'Ty',
		content: text,
		createdAt: new Date().toISOString()
	}
	chat.messages.push(message)
	chat.lastMessage = text
	newMessageText.value = ''
	nextTick(() => handleScrollToBottom())
}

// key handlers przeniesione do komponentów podrzędnych

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
					<ChatList
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
