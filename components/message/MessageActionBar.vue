<script setup lang="ts">
import type EmojiTooltip from '../ui/EmojiTooltip.vue'
import MessageContextMenu from './MessageContextMenu.vue'

interface Props {
	messageId: string | number
	currentUserId: string | number
	groupedReactions: Record<string, any>
	userReactions: any[]
	isDeleting: boolean
	position: 'left' | 'right'
	isOwnMessage: boolean
	isPinned: boolean
	shouldShow: boolean
	showContextMenu: boolean
}

interface Emits {
	(e: 'emoji-click'): void
	(e: 'reply-click'): void
	(e: 'context-menu-toggle'): void
	(e: 'reaction-click', emoji: string): void
	(e: 'tooltip-show-change', show: boolean): void
	(e: 'mouseenter'): void
	(e: 'mouseleave'): void
	(e: 'delete'): void
	(e: 'pin'): void
	(e: 'context-menu-mouseenter'): void
	(e: 'context-menu-mouseleave'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const emojiTooltipRef = ref<InstanceType<typeof EmojiTooltip> | null>(null)
const contextMenuRef = ref<HTMLDivElement | null>(null)
const emojiTooltipContainerRef = ref<HTMLDivElement | null>(null)

function handleEmojiButtonClick() {
	emit('emoji-click')
	emojiTooltipRef.value?.showTooltip()
}

function handleTooltipShowChange(show: boolean) {
	emit('tooltip-show-change', show)
}

defineExpose({
	emojiTooltipRef,
	contextMenuRef,
	emojiTooltipContainerRef
})
</script>

<template>
	<div
		v-if="shouldShow"
		class="flex items-center gap-1 transition-opacity duration-200"
		:class="{
			'opacity-100': shouldShow,
			'opacity-0': !shouldShow
		}"
		@mouseenter="emit('mouseenter')"
		@mouseleave="emit('mouseleave')"
	>
		<div
			ref="emojiTooltipContainerRef"
			class="relative"
			@mouseenter="emit('mouseenter')"
		>
			<button
				type="button"
				tabindex="0"
				aria-label="Dodaj reakcję"
				class="h-8 w-8 rounded-full bg-white hover:bg-gray-100 border border-gray-300 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 shadow-sm"
				@click.stop="handleEmojiButtonClick"
				@keydown="(e) => e.key === 'Enter' && handleEmojiButtonClick()"
			>
				<span class="text-base">😊</span>
			</button>
			<EmojiTooltip
				ref="emojiTooltipRef"
				:message-id="messageId"
				:current-user-id="currentUserId"
				:grouped-reactions="groupedReactions"
				:user-reactions="userReactions"
				:is-deleting="isDeleting"
				:position="position"
				@reaction-click="emit('reaction-click', $event)"
				@show-change="handleTooltipShowChange"
			/>
		</div>
		<button
			type="button"
			tabindex="0"
			aria-label="Odpowiedz na wiadomość"
			class="h-8 w-8 rounded-full bg-white hover:bg-gray-100 border border-gray-300 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 shadow-sm"
			@click.stop="emit('reply-click')"
			@keydown="
				(e) => (e.key === 'Enter' || e.key === ' ') && emit('reply-click')
			"
		>
			<span class="text-base">↩️</span>
		</button>
		<div class="relative">
			<button
				type="button"
				tabindex="0"
				aria-label="Menu kontekstowe"
				class="h-8 w-8 rounded-full bg-white hover:bg-gray-100 border border-gray-300 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 shadow-sm"
				@click.stop="emit('context-menu-toggle')"
				@keydown="
					(e) => (e.key === 'Enter' || e.key === ' ') && emit('context-menu-toggle')
				"
			>
				<Icon name="context-menu-dots" class="h-4 w-4" />
			</button>
			<MessageContextMenu
				v-if="showContextMenu"
				ref="contextMenuRef"
				:is-own-message="isOwnMessage"
				:is-pinned="isPinned"
				:position="position"
				@delete="emit('delete')"
				@pin="emit('pin')"
				@mouseenter="emit('context-menu-mouseenter')"
				@mouseleave="emit('context-menu-mouseleave')"
			/>
		</div>
	</div>
</template>

