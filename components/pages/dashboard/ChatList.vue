<script setup lang="ts">
import type { Chat } from '~/types/Chat'

const props = defineProps<{
	chats: Chat[]
	selectedChatId: number | null
}>()

const emit = defineEmits<{
	(e: 'select-chat', chatId: number): void
}>()

function handleSelect(chatId: number) {
	emit('select-chat', chatId)
}

function handleListKeyDown(event: KeyboardEvent, chatId: number) {
	if (event.key !== 'Enter' && event.key !== ' ') return
	event.preventDefault()
	handleSelect(chatId)
}
</script>

<template>
	<div class="flex-1 overflow-y-auto bg-white">
		<ul class="divide-y divide-gray-100" role="listbox" aria-label="Lista czatów">
			<li v-for="chat in props.chats" :key="chat.id" class="cursor-pointer select-none">
				<div
					tabindex="0"
					role="option"
					:aria-selected="props.selectedChatId === chat.id"
					:aria-label="`Otwórz czat: ${chat.name}`"
					class="flex items-center gap-3 px-4 py-3 hover:bg-slate-50 focus:bg-slate-50 outline-none"
					:class="props.selectedChatId === chat.id ? 'bg-blue-50' : ''"
					@click="handleSelect(chat.id)"
					@keydown="handleListKeyDown($event, chat.id)"
				>
					<div
						class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold"
					>
						{{ (chat.name ?? '').charAt(0) || '?' }}
					</div>
					<div class="min-w-0 flex-1">
						<div class="flex items-center justify-between">
							<p class="font-medium text-slate-900 truncate">
								{{ chat.name ?? 'Czat' }}
							</p>
							<span
								v-if="chat.unreadCount > 0"
								class="ml-2 inline-flex items-center justify-center text-xs font-semibold bg-blue-600 text-white rounded-full h-5 px-2"
							>
								{{ chat.unreadCount }}
							</span>
						</div>
						<p class="text-sm text-slate-600 truncate">{{ chat.lastMessage ?? '' }}</p>
					</div>
				</div>
			</li>
		</ul>
	</div>
</template>
