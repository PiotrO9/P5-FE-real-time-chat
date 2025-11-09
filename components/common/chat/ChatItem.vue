<script setup lang="ts">
import type { Chat } from '~/types/Chat'

interface Props {
	chat: Chat
	isSelected: boolean
	typingUsers?: string[]
}

const props = defineProps<Props>()

const emit = defineEmits<{ (e: 'select', chatId: number): void }>()

const chatData = computed(() => props.chat)
const selected = computed(() => props.isSelected)

const chatInitial = computed(() => (chatData.value.name ?? '').charAt(0) || '?')
const chatName = computed(() =>
	chatData.value.isGroup ? chatData.value.name : chatData.value.otherUser.username
)
const lastMessage = computed(() => chatData.value.lastMessage?.content || '')
const unreadCount = computed(() => Number(chatData.value.unreadCount))

const typingUsers = computed(() => props.typingUsers ?? [])
const hasTypingUsers = computed(() => typingUsers.value.length > 0)

const typingText = computed(() => {
	if (!hasTypingUsers.value) return null

	if (typingUsers.value.length === 1) {
		return `${typingUsers.value[0]} pisze...`
	}
	if (typingUsers.value.length === 2) {
		return `${typingUsers.value[0]} i ${typingUsers.value[1]} piszą...`
	}
	return `${typingUsers.value[0]} i ${typingUsers.value.length - 1} innych piszą...`
})

const displayMessage = computed(() => {
	if (hasTypingUsers.value && typingText.value) {
		return typingText.value
	}
	return lastMessage.value || 'Brak wiadomości'
})

const hasUnread = computed(() => Number(chatData.value.unreadCount) > 0)
const isOver99 = computed(() => unreadCount.value > 99)

const itemClasses = computed(() => {
	const base =
		'flex items-center gap-3 px-4 py-3 hover:bg-slate-50 focus:bg-slate-50 outline-none'
	return selected.value ? `${base} bg-blue-50` : base
})

const badgeClasses = computed(() => {
	const base =
		'inline-flex items-center justify-center font-semibold bg-blue-600 text-white rounded-full size-7 px-2'
	return isOver99.value ? `${base} text-[10px]` : `${base} text-xs`
})

const ariaLabel = computed(() => `Otwórz czat: ${chatName.value}`)

function handleClick() {
	emit('select', chatData.value.id)
}

function handleKeyDown(event: KeyboardEvent) {
	if (event.key !== 'Enter' && event.key !== ' ') return
	event.preventDefault()
	emit('select', chatData.value.id)
}
</script>

<template>
	<li class="cursor-pointer select-none">
		<div
			tabindex="0"
			role="option"
			:aria-selected="selected"
			:aria-label="ariaLabel"
			:class="itemClasses"
			@click="handleClick"
			@keydown="handleKeyDown"
		>
			<div
				class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold"
			>
				{{ chatInitial }}
			</div>
			<div class="min-w-0 flex-1 flex flex-col">
				<div class="flex items-center justify-between gap-2 min-w-0">
					<p class="font-medium text-slate-900 truncate min-w-0">
						{{ chatName }}
					</p>
					<span v-if="hasUnread" :class="`${badgeClasses} flex-shrink-0`">
						{{ unreadCount > 99 ? '99+' : unreadCount }}
					</span>
					<span v-else class="size-7 flex-shrink-0" aria-hidden="true"></span>
				</div>
				<div
					v-if="hasTypingUsers"
					:class="[
						'text-sm truncate min-w-0 flex items-center gap-1.5 text-blue-600 italic'
					]"
				>
					<!-- Animowane kropki w stylu Messengera -->
					<div class="flex items-center gap-0.5 flex-shrink-0">
						<span
							class="w-1.5 h-1.5 bg-blue-600 rounded-full typing-dot"
							style="animation-delay: 0ms"
						></span>
						<span
							class="w-1.5 h-1.5 bg-blue-600 rounded-full typing-dot"
							style="animation-delay: 150ms"
						></span>
						<span
							class="w-1.5 h-1.5 bg-blue-600 rounded-full typing-dot"
							style="animation-delay: 300ms"
						></span>
					</div>
					<span class="truncate">{{ typingText }}</span>
				</div>
				<p v-else :class="['text-sm truncate min-w-0 text-slate-600']">
					{{ displayMessage }}
				</p>
			</div>
		</div>
	</li>
</template>
