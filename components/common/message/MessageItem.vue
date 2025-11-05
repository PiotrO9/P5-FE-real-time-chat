<script setup lang="ts">
import type { Message, Reaction } from '~/types/Chat'
import Dialog from '~/components/common/Dialog.vue'
import { addReaction, removeReaction } from '~/services/chatService'

interface Props {
	message: Message
}

const props = defineProps<Props>()

interface Emits {
	(e: 'delete', messageId: string | number): void
	(
		e: 'reaction-updated',
		messageId: string | number,
		emoji: string,
		action: 'add' | 'remove'
	): void
}

const emit = defineEmits<Emits>()

const message = computed(() => props.message)

const { user } = useAuth()
const currentUserId = computed(() => user.value?.id ?? 0)

const isOwnMessage = computed(() => message.value.senderId === currentUserId.value)

const showDeleteButton = ref(false)
const isFocused = ref(false)
const isDeleting = ref(false)
const showDeleteDialog = ref(false)
const justClosedDialog = ref(false)

const showReactionPicker = ref(false)
const isReacting = ref(false)
const reactionsContainerRef = ref<HTMLDivElement | null>(null)

const quickReactions = ['👍', '❤️', '😄', '😮', '😢', '🙏']

const senderDisplayName = computed(() => {
	if (isOwnMessage.value) {
		return message.value.senderUsername || 'Ty'
	}
	return message.value.senderUsername || 'Nieznany'
})

const formattedTime = computed(() => {
	return new Date(message.value.createdAt).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit'
	})
})

const avatarInitial = computed(() => {
	const name = message.value.senderUsername || '?'
	return name.charAt(0).toUpperCase()
})

const messageContent = computed(() => message.value.content)

const shouldShowDeleteButton = computed(() => {
	return isOwnMessage.value && !isDeleting.value && (showDeleteButton.value || isFocused.value)
})

const deleteButtonRef = ref<HTMLButtonElement | null>(null)
const isButtonFocused = ref(false)

const reactions = computed(() => message.value.reactions || [])

interface GroupedReaction {
	userIds: (string | number)[]
	reactions: Reaction[]
}

const groupedReactions = computed<Record<string, GroupedReaction>>(() => {
	const groups: Record<string, GroupedReaction> = {}
	reactions.value.forEach((reaction) => {
		if (!groups[reaction.emoji]) {
			groups[reaction.emoji] = {
				userIds: [...reaction.userIds],
				reactions: [reaction]
			}
		} else {
			const group = groups[reaction.emoji]
			if (group) {
				reaction.userIds.forEach((userId) => {
					if (!group.userIds.includes(userId)) {
						group.userIds.push(userId)
					}
				})

				group.reactions.push(reaction)
			}
		}
	})
	return groups
})

const hasReactions = computed(() => reactions.value.length > 0)

const userReactions = computed(() => {
	return reactions.value.filter((r) =>
		r.userIds.some((userId) => String(userId) === String(currentUserId.value))
	)
})

function hasUserReaction(emoji: string): boolean {
	const reactionGroup = groupedReactions.value[emoji]

	if (!reactionGroup) return false

	const foundReaction = reactionGroup.reactions.find((r) => r.emoji == emoji)

	if (!foundReaction) return false

	return foundReaction.userIds.some((userId) => String(userId) === String(currentUserId.value))
}

function getReactionCount(emoji: string): number {
	return groupedReactions.value[emoji]?.userIds.length || 0
}

function handleFocus() {
	if (isOwnMessage.value && !isDeleting.value) {
		isFocused.value = true
	}
}

function handleBlur() {
	isFocused.value = false
}

function handleButtonFocus() {
	isFocused.value = true
	isButtonFocused.value = true
}

function handleButtonBlur() {
	isFocused.value = false
	isButtonFocused.value = false
}

function handleDeleteClick() {
	if (!isOwnMessage.value || isDeleting.value || justClosedDialog.value) return
	showDeleteDialog.value = true
}

function handleDeleteKeyDown(event: KeyboardEvent) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		handleDeleteClick()
	}
}

function handleConfirmDelete() {
	isDeleting.value = true
	emit('delete', String(message.value.id))
}

function handleCancelDelete() {
	// handleDialogUpdate zostanie wywołane przez @update:open
}

function resetDialogState() {
	justClosedDialog.value = true
	isFocused.value = false
	isButtonFocused.value = false

	nextTick(() => {
		setTimeout(() => {
			justClosedDialog.value = false
		}, 100)
	})
}

function handleDialogUpdate(open: boolean) {
	showDeleteDialog.value = open
	if (!open) {
		resetDialogState()
	}
}

function handleMessageMouseEnter() {
	if (!isDeleting.value) {
		if (isOwnMessage.value) {
			showDeleteButton.value = true
		}
		showReactionPicker.value = true
	}
}

function handleMessageMouseLeave() {
	showDeleteButton.value = false
	if (!showReactionPicker.value) {
		return
	}
	setTimeout(() => {
		if (!reactionsContainerRef.value?.matches(':hover')) {
			showReactionPicker.value = false
		}
	}, 200)
}

function handleReactionPickerMouseEnter() {
	showReactionPicker.value = true
}

function handleReactionPickerMouseLeave() {
	showReactionPicker.value = false
}

async function handleReactionClick(emoji: string) {
	if (isReacting.value) return

	const hasThisReaction = hasUserReaction(emoji)
	const currentUserReaction = userReactions.value.find((r) => r.emoji === emoji)

	try {
		isReacting.value = true

		if (hasThisReaction || currentUserReaction) {
			await removeReaction(message.value.id, emoji)
			emit('reaction-updated', message.value.id, emoji, 'remove')
		} else {
			const otherUserReaction = userReactions.value[0]

			if (otherUserReaction) {
				await removeReaction(message.value.id, otherUserReaction.emoji)
				emit('reaction-updated', message.value.id, otherUserReaction.emoji, 'remove')
			}

			await addReaction(message.value.id, emoji)
			emit('reaction-updated', message.value.id, emoji, 'add')
		}
	} catch (error) {
		console.error('Błąd podczas obsługi reakcji:', error)
	} finally {
		isReacting.value = false
		showReactionPicker.value = false
	}
}

function handleReactionKeyDown(event: KeyboardEvent, emoji: string) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		handleReactionClick(emoji)
	}
}

function handleReactionBadgeClick(emoji: string, event: Event) {
	event.stopPropagation()
	handleReactionClick(emoji)
}

function handleReactionBadgeKeyDown(event: KeyboardEvent, emoji: string) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		event.stopPropagation()
		handleReactionClick(emoji)
	}
}
</script>

<template>
	<div class="w-full flex group" :class="isOwnMessage ? 'justify-end' : 'justify-start'">
		<div v-if="!isOwnMessage" class="flex items-start gap-2 max-w-[85%] relative">
			<div
				class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold flex-shrink-0"
				:aria-label="`Awatar ${senderDisplayName}`"
			>
				{{ avatarInitial }}
			</div>
			<div class="min-w-0 flex-1">
				<p class="text-xs font-medium text-gray-700 mb-1">
					{{ senderDisplayName }}
				</p>
				<div
					class="relative"
					@mouseenter="handleMessageMouseEnter"
					@mouseleave="handleMessageMouseLeave"
				>
					<div
						class="max-w-full rounded-2xl px-4 py-2 text-sm shadow-sm bg-white text-gray-900 border border-gray-200 rounded-bl-none"
						:aria-label="`Wiadomość od ${senderDisplayName}`"
					>
						<p class="whitespace-pre-wrap break-words">{{ messageContent }}</p>
						<p class="mt-1 text-[10px] opacity-70">
							{{ formattedTime }}
						</p>
					</div>

					<div v-if="hasReactions" class="flex flex-wrap gap-1 mt-1 px-1">
						<button
							v-for="(reactionGroup, emoji) in groupedReactions"
							:key="emoji"
							type="button"
							tabindex="0"
							:aria-label="`${getReactionCount(emoji)} reakcji ${emoji}, kliknij aby ${hasUserReaction(emoji) ? 'usunąć' : 'dodać'} reakcję`"
							class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
							:class="{
								'bg-blue-100 border-blue-300': hasUserReaction(emoji)
							}"
							@click="handleReactionBadgeClick(emoji, $event)"
							@keydown="handleReactionBadgeKeyDown($event, emoji)"
						>
							<span>{{ emoji }}</span>
							<span class="font-medium text-gray-700">{{
								getReactionCount(emoji)
							}}</span>
						</button>
					</div>

					<div
						v-if="showReactionPicker"
						ref="reactionsContainerRef"
						class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex gap-1 bg-white rounded-full px-2 py-1 shadow-lg border border-gray-200 z-20"
						@mouseenter="handleReactionPickerMouseEnter"
						@mouseleave="handleReactionPickerMouseLeave"
					>
						<button
							v-for="emoji in quickReactions"
							:key="emoji"
							type="button"
							tabindex="0"
							:aria-label="`Dodaj reakcję ${emoji}`"
							class="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform rounded-full hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
							:class="{
								'bg-blue-50': hasUserReaction(emoji)
							}"
							:disabled="isReacting"
							@click="handleReactionClick(emoji)"
							@keydown="handleReactionKeyDown($event, emoji)"
						>
							{{ emoji }}
						</button>
					</div>
				</div>
			</div>
		</div>

		<div
			v-else
			class="flex flex-col items-end max-w-[85%] relative"
			tabindex="0"
			@mouseenter="handleMessageMouseEnter"
			@mouseleave="handleMessageMouseLeave"
			@focusin="handleFocus"
			@focusout="handleBlur"
		>
			<p class="text-xs font-medium text-gray-700 mb-1 mr-2">
				{{ senderDisplayName }}
			</p>
			<div class="relative">
				<div
					class="relative rounded-2xl px-4 py-2 text-sm shadow-sm bg-blue-600 text-white rounded-br-none"
					:class="{ 'opacity-50': isDeleting }"
					:aria-label="isDeleting ? 'Usuwanie wiadomości...' : 'Wiadomość od Ciebie'"
				>
					<button
						v-if="isOwnMessage && !isDeleting"
						ref="deleteButtonRef"
						type="button"
						tabindex="0"
						aria-label="Usuń wiadomość"
						class="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 hover:bg-red-600 active:bg-red-700 text-white flex items-center justify-center transition-all duration-150 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 z-10"
						:class="{
							'opacity-100': shouldShowDeleteButton || isButtonFocused,
							'opacity-0': !shouldShowDeleteButton && !isButtonFocused
						}"
						@click="handleDeleteClick"
						@keydown="handleDeleteKeyDown"
						@focus="handleButtonFocus"
						@blur="handleButtonBlur"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-3.5 w-3.5"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
							stroke-width="2"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
							/>
						</svg>
					</button>
					<p v-if="isDeleting" class="whitespace-pre-wrap break-words italic">
						Usuwanie...
					</p>
					<template v-else>
						<p class="whitespace-pre-wrap break-words">{{ messageContent }}</p>
						<p class="mt-1 text-[10px] opacity-70">
							{{ formattedTime }}
						</p>
					</template>
				</div>

				<div v-if="hasReactions" class="flex flex-wrap gap-1 mt-1 px-1 justify-end">
					<button
						v-for="(reactionGroup, emoji) in groupedReactions"
						:key="emoji"
						type="button"
						tabindex="0"
						:aria-label="`${getReactionCount(emoji)} reakcji ${emoji}, kliknij aby ${hasUserReaction(emoji) ? 'usunąć' : 'dodać'} reakcję`"
						class="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1"
						:class="{
							'bg-blue-100 border-blue-300': hasUserReaction(emoji)
						}"
						@click="handleReactionBadgeClick(emoji, $event)"
						@keydown="handleReactionBadgeKeyDown($event, emoji)"
					>
						<span>{{ emoji }}</span>
						<span class="font-medium text-gray-700">{{ getReactionCount(emoji) }}</span>
					</button>
				</div>

				<div
					v-if="showReactionPicker"
					ref="reactionsContainerRef"
					class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 flex gap-1 bg-white rounded-full px-2 py-1 shadow-lg border border-gray-200 z-20"
					@mouseenter="handleReactionPickerMouseEnter"
					@mouseleave="handleReactionPickerMouseLeave"
				>
					<button
						v-for="emoji in quickReactions"
						:key="emoji"
						type="button"
						tabindex="0"
						:aria-label="`Dodaj reakcję ${emoji}`"
						class="w-8 h-8 flex items-center justify-center text-lg hover:scale-125 transition-transform rounded-full hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
						:class="{
							'bg-blue-50': hasUserReaction(emoji)
						}"
						:disabled="isReacting"
						@click="handleReactionClick(emoji)"
						@keydown="handleReactionKeyDown($event, emoji)"
					>
						{{ emoji }}
					</button>
				</div>
			</div>
		</div>

		<Dialog
			:open="showDeleteDialog"
			title="Usuń wiadomość"
			message="Czy na pewno chcesz usunąć tę wiadomość? Tej operacji nie można cofnąć."
			confirm-text="Usuń"
			cancel-text="Anuluj"
			@update:open="handleDialogUpdate"
			@confirm="handleConfirmDelete"
			@cancel="handleCancelDelete"
		/>
	</div>
</template>
