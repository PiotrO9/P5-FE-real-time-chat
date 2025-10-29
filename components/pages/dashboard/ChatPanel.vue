<script setup lang="ts">
import type { Chat } from '~/types/Chat'

const props = defineProps<{
	selectedChat: Chat | null
	currentUserId: number
	canLoadMore?: boolean
	isLoadingMore?: boolean
}>()

const messagesContainerRef = ref<HTMLDivElement | null>(null)

function scrollToBottom() {
	const el = messagesContainerRef.value
	if (!el) return
	el.scrollTop = el.scrollHeight
}

const emit = defineEmits<{ (e: 'load-more'): void }>()

function handleLoadMoreClick() {
	emit('load-more')
}

function handleLoadMoreKeyDown(event: KeyboardEvent) {
	if (event.key !== 'Enter' && event.key !== ' ') return
	event.preventDefault()
	emit('load-more')
}

defineExpose({ scrollToBottom })
</script>

<template>
	<section v-if="props.selectedChat" class="hidden md:flex flex-1 flex-col h-full">
		<div
			class="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60"
		>
			<div class="flex items-center gap-3">
				<div
					class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold"
				>
					{{ (props.selectedChat.name ?? '').charAt(0) || '?' }}
				</div>
				<h2 class="text-lg font-semibold text-gray-900">
					{{ props.selectedChat.name ?? 'Czat' }}
				</h2>
			</div>
		</div>

		<div
			ref="messagesContainerRef"
			class="flex-1 overflow-y-auto px-4 md:px-6 py-4 space-y-4 bg-gray-50"
		>
			<div v-if="props.canLoadMore" class="flex justify-center">
				<button
					type="button"
					class="text-sm text-blue-600 hover:text-blue-700 underline disabled:opacity-50"
					:aria-label="
						props.isLoadingMore
							? 'Ładowanie starszych wiadomości'
							: 'Załaduj starsze wiadomości'
					"
					:tabindex="0"
					:disabled="props.isLoadingMore"
					@click="handleLoadMoreClick"
					@keydown="handleLoadMoreKeyDown"
				>
					{{ props.isLoadingMore ? 'Ładowanie...' : 'Załaduj starsze' }}
				</button>
			</div>
			<div
				v-for="m in props.selectedChat.messages"
				:key="m.id"
				class="flex"
				:class="m.senderId === props.currentUserId ? 'justify-end' : 'justify-start'"
			>
				<div
					class="max-w-[75%] rounded-2xl px-4 py-2 text-sm shadow-sm"
					:class="
						m.senderId === props.currentUserId
							? 'bg-blue-600 text-white rounded-br-none'
							: 'bg-white text-gray-900 border border-gray-200 rounded-bl-none'
					"
					:aria-label="`Wiadomość od ${m.senderId === props.currentUserId ? 'Ciebie' : m.senderName}`"
				>
					<p class="whitespace-pre-wrap">{{ m.content }}</p>
					<p class="mt-1 text-[10px] opacity-70">
						{{
							new Date(m.createdAt).toLocaleTimeString([], {
								hour: '2-digit',
								minute: '2-digit'
							})
						}}
					</p>
				</div>
			</div>
		</div>

		<!-- Mobile placeholder when no chat selected handled by parent -->
	</section>

	<section v-else class="md:hidden flex-1 flex flex-col">
		<div class="flex-1 flex items-center justify-center text-gray-500">
			Wybierz czat z listy po lewej
		</div>
	</section>
</template>
