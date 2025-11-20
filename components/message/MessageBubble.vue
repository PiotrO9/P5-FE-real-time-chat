<script setup lang="ts">
import type { Message } from '~/types/Chat'

interface Props {
	message: Message
	isOwnMessage: boolean
	isPinned: boolean
	isDeleting: boolean
	isEditing: boolean
	editContent: string
	isUpdating: boolean
	highlighted?: boolean
	senderDisplayName: string
	formattedTime: string
	isEdited: boolean
	editTextareaRef?: (el: HTMLTextAreaElement | null) => void
}

interface Emits {
	(e: 'cancel-edit'): void
	(e: 'save-edit'): void
	(e: 'keydown', event: KeyboardEvent): void
	(e: 'update:editContent', value: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const bubbleClasses = computed(() => {
	if (props.isOwnMessage) {
		return {
			'opacity-50': props.isDeleting,
			'bg-blue-600 text-white': !props.isPinned,
			'bg-yellow-500 text-white': props.isPinned,
			'ring-2 ring-gray-900 ring-offset-2': props.highlighted,
			'rounded-br-none': true
		}
	} else {
		return {
			'bg-white border-gray-200': !props.isPinned,
			'bg-yellow-50 border-yellow-300': props.isPinned,
			'ring-2 ring-gray-900 ring-offset-2': props.highlighted,
			'rounded-bl-none': true
		}
	}
})

const ariaLabel = computed(() => {
	if (props.isDeleting) return 'Deleting message...'
	if (props.isOwnMessage) {
		return `Message from you${props.isPinned ? ' (pinned)' : ''}`
	}
	return `Message from ${props.senderDisplayName}${props.isPinned ? ' (pinned)' : ''}`
})
</script>

<template>
	<div
		class="relative rounded-2xl px-4 py-2 text-sm shadow-sm transition-all duration-300"
		:class="[
			isOwnMessage ? 'rounded-br-none' : 'max-w-full border rounded-bl-none',
			bubbleClasses
		]"
		:aria-label="ariaLabel"
	>
		<p v-if="isDeleting" class="whitespace-pre-wrap break-words italic">Deleting...</p>
		<template v-else-if="isEditing">
			<textarea
				:ref="editTextareaRef"
				:value="editContent"
				:disabled="isUpdating"
				class="w-full bg-transparent text-white placeholder-white/70 resize-none focus:outline-none focus:ring-0 border-none p-0 m-0"
				rows="3"
				aria-label="Edit message"
				@keydown="emit('keydown', $event)"
				@blur="emit('cancel-edit')"
				@input="(e) => $emit('update:editContent', (e.target as HTMLTextAreaElement).value)"
			/>
			<div class="mt-2 flex items-center gap-2 justify-end">
				<button
					type="button"
					tabindex="0"
					aria-label="Cancel edit"
					class="px-3 py-1 text-xs bg-white/20 hover:bg-white/30 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
					@mousedown.prevent
					@click.stop="emit('cancel-edit')"
					@keydown="(e) => e.key === 'Enter' && emit('cancel-edit')"
				>
					Cancel
				</button>
				<button
					type="button"
					tabindex="0"
					aria-label="Save changes"
					:disabled="isUpdating || !editContent || editContent.trim() === message.content"
					class="px-3 py-1 text-xs bg-white text-blue-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
					@mousedown.prevent
					@click.stop="emit('save-edit')"
					@keydown="(e) => e.key === 'Enter' && emit('save-edit')"
				>
					{{ isUpdating ? 'Saving...' : 'Save' }}
				</button>
			</div>
		</template>
		<template v-else>
			<div
				v-if="message.forwardedFrom"
				class="mb-2 pb-2 border-b border-current border-opacity-20"
			>
				<p class="text-xs opacity-80 font-medium">
					Przekazane z:
					{{ message.forwardedFrom.chatName || 'Czat prywatny' }}
				</p>
				<p class="text-[10px] opacity-60">
					{{ message.forwardedFrom.senderUsername }} •
					{{
						new Date(message.forwardedFrom.originalCreatedAt).toLocaleString('pl-PL', {
							day: '2-digit',
							month: '2-digit',
							year: 'numeric',
							hour: '2-digit',
							minute: '2-digit'
						})
					}}
				</p>
			</div>
			<p class="whitespace-pre-wrap break-words">{{ message.content }}</p>
			<p class="mt-1 text-[10px] opacity-70 flex items-center gap-1">
				{{ formattedTime }}
				<span v-if="isEdited" class="italic opacity-60">(edited)</span>
			</p>
		</template>
	</div>
</template>
