<script setup lang="ts">
import type { Chat } from '~/types/Chat'

interface Props {
	chat: Chat
	isSelected: boolean
}

const props = defineProps<Props>()

const emit = defineEmits<{ (e: 'select', chatId: number): void }>()

const chatData = computed(() => props.chat)
const selected = computed(() => props.isSelected)

const chatInitial = computed(() => (chatData.value.name ?? '').charAt(0) || '?')
const chatName = computed(() => chatData.value.name ?? 'Czat')
const lastMessage = computed(() => chatData.value.lastMessage?.content || '')
const unreadCount = computed(() => Number(chatData.value.unreadCount))

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
				<p class="text-sm text-slate-600 truncate min-w-0">
					{{ lastMessage || 'Brak wiadomości' }}
				</p>
			</div>
		</div>
	</li>
</template>
