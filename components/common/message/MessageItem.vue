<script setup lang="ts">
import type { Message, Reaction } from '~/types/Chat'
import { addReaction, removeReaction, pinMessage, unpinMessage } from '~/services/chatService'
import Dialog from '~/components/common/Dialog.vue'
import EmojiTooltip from '~/components/common/emoji/EmojiTooltip.vue'
import Icon from '../Icon.vue'
import { useChatStore } from '~/stores/chatStore'
import { useToast } from '~/composables/useToast'
import { useMessageHelpers } from '~/composables/useMessageHelpers'

interface GroupedReaction {
	userIds: (string | number)[]
	reactions: Reaction[]
}

interface Props {
	message: Message
}

interface Emits {
	(e: 'delete', messageId: string | number): void
	(
		e: 'reaction-updated',
		messageId: string | number,
		emoji: string,
		action: 'add' | 'remove'
	): void
	(e: 'pin-updated', messageId: string | number, isPinned: boolean): void
}

const { user } = useAuth()
const chatStore = useChatStore()
const { error: toastError } = useToast()

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showDeleteButton = ref(false)
const showPinButtonFlag = ref(false)
const isFocused = ref(false)
const isDeleting = ref(false)
const showDeleteDialog = ref(false)
const justClosedDialog = ref(false)
const isReacting = ref(false)
const isPinning = ref(false)
const emojiTooltipRef = ref<InstanceType<typeof EmojiTooltip> | null>(null)
const deleteButtonRef = ref<HTMLButtonElement | null>(null)
const isButtonFocused = ref(false)

const message = computed(() => props.message)
const currentUserId = computed(() => user.value?.id ?? 0)
const isOwnMessage = computed(() => message.value.senderId === currentUserId.value)
const senderDisplayName = computed(() => {
	if (isOwnMessage.value) {
		return message.value.senderUsername || 'You'
	}
	return message.value.senderUsername || 'Unknown'
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
const reactions = computed(() => message.value.reactions || [])
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
const isPinned = computed(() => message.value.isPinned ?? false)
const showPinButton = computed(() => {
	return (
		!isDeleting.value &&
		(showPinButtonFlag.value || isFocused.value || isButtonFocused.value || isPinned.value)
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
	if (!isDeleting.value) {
		isFocused.value = true
		showPinButtonFlag.value = true
	}
}

function handleBlur() {
	isFocused.value = false
	showPinButtonFlag.value = false
}

function handleButtonFocus() {
	isFocused.value = true
	isButtonFocused.value = true
}

function handleButtonBlur() {
	isFocused.value = false
	isButtonFocused.value = false
	showPinButtonFlag.value = false
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

function handleCancelDelete() {}

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
		showPinButtonFlag.value = true
		emojiTooltipRef.value?.showTooltip()
	}
}

function handleMessageMouseLeave() {
	showDeleteButton.value = false
	showPinButtonFlag.value = false
	emojiTooltipRef.value?.hideTooltip()
}

function handleTooltipShowChange(_show: boolean) {}

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
	} catch {
	} finally {
		isReacting.value = false
	}
}

async function handlePinClick() {
	if (isPinning.value || isDeleting.value) return

	const chatId = message.value.chatId
	const shouldUnpin = message.value.isPinned === true

	try {
		isPinning.value = true

		if (shouldUnpin) {
			await unpinMessage(chatId, message.value.id)
			chatStore.removePinnedMessage(chatId, message.value.id)
			message.value.isPinned = false
			message.value.pinnedBy = undefined
			message.value.pinnedAt = undefined
			emit('pin-updated', message.value.id, false)
		} else {
			if (message.value.isPinned === true) {
				return
			}

			const res = await pinMessage(chatId, message.value.id)
			const { mapMessageFromBackend } = useMessageHelpers()

			if (res?.data) {
				const pinnedData = res.data
				if (pinnedData.message) {
					const mappedMessage = mapMessageFromBackend(pinnedData.message)
					message.value.isPinned = mappedMessage.isPinned ?? true
					message.value.pinnedBy = mappedMessage.pinnedBy
					message.value.pinnedAt = mappedMessage.pinnedAt
					const pinnedMessageForStore = {
						...message.value,
						isPinned: mappedMessage.isPinned ?? true,
						pinnedBy: mappedMessage.pinnedBy,
						pinnedAt: mappedMessage.pinnedAt
					}
					chatStore.addPinnedMessage(chatId, pinnedMessageForStore)
				} else {
					message.value.isPinned = true
					chatStore.addPinnedMessage(chatId, message.value)
				}
			} else {
				message.value.isPinned = true
				chatStore.addPinnedMessage(chatId, message.value)
			}
			emit('pin-updated', message.value.id, true)
		}
	} catch (error: any) {
		const errorMessage = error?.response?._data?.message || error?.message
		toastError(errorMessage || 'Nie udało się zaktualizować przypięcia')
	} finally {
		isPinning.value = false
	}
}

function handlePinKeyDown(event: KeyboardEvent) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		handlePinClick()
	}
}
</script>

<template>
	<div
		class="w-full flex group"
		:class="isOwnMessage ? 'justify-end' : 'justify-start'"
		:data-message-id="message.id"
	>
		<div v-if="!isOwnMessage" class="flex items-start gap-2 max-w-[85%] relative">
			<div
				class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold flex-shrink-0"
				:aria-label="`Avatar ${senderDisplayName}`"
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
						class="max-w-full rounded-2xl px-4 py-2 text-sm shadow-sm text-gray-900 border rounded-bl-none relative"
						:class="{
							'bg-white border-gray-200': !isPinned,
							'bg-yellow-50 border-yellow-300': isPinned
						}"
						:aria-label="`Message from ${senderDisplayName}${isPinned ? ' (przypięta)' : ''}`"
					>
						<button
							v-if="showPinButton || isPinned"
							type="button"
							tabindex="0"
							:aria-label="isPinned ? 'Odepnij wiadomość' : 'Przypnij wiadomość'"
							class="absolute -top-2 -right-2 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-150 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 z-10"
							:class="{
								'opacity-100': showPinButton || isPinned,
								'opacity-0': !showPinButton && !isPinned,
								'bg-yellow-100 hover:bg-yellow-200 text-yellow-700': isPinned,
								'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700':
									!isPinned
							}"
							@click.stop="handlePinClick"
							@keydown="handlePinKeyDown"
						>
							<span class="text-xs">📌</span>
						</button>
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
							:aria-label="`${getReactionCount(emoji)} reactions ${emoji}, click to ${hasUserReaction(emoji) ? 'remove' : 'add'} reaction`"
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

					<EmojiTooltip
						ref="emojiTooltipRef"
						:message-id="message.id"
						:current-user-id="currentUserId"
						:grouped-reactions="groupedReactions"
						:user-reactions="userReactions"
						:is-deleting="isDeleting"
						position="left"
						@reaction-click="handleReactionClick"
						@show-change="handleTooltipShowChange"
					/>
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
					class="relative rounded-2xl px-4 py-2 text-sm shadow-sm rounded-br-none"
					:class="{
						'opacity-50': isDeleting,
						'bg-blue-600 text-white': !isPinned,
						'bg-yellow-500 text-white': isPinned
					}"
					:aria-label="
						isDeleting
							? 'Deleting message...'
							: `Message from you${isPinned ? ' (przypięta)' : ''}`
					"
				>
					<button
						v-if="showPinButton || isPinned"
						type="button"
						tabindex="0"
						:aria-label="isPinned ? 'Odepnij wiadomość' : 'Przypnij wiadomość'"
						class="absolute -top-2 -left-2 h-6 w-6 rounded-full flex items-center justify-center transition-all duration-150 shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 z-10"
						:class="{
							'opacity-100': showPinButton || isPinned,
							'opacity-0': !showPinButton && !isPinned,
							'bg-yellow-100 hover:bg-yellow-200 text-yellow-700': isPinned,
							'bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-700':
								!isPinned
						}"
						@click.stop="handlePinClick"
						@keydown="handlePinKeyDown"
					>
						<span class="text-xs">📌</span>
					</button>
					<button
						v-if="isOwnMessage && !isDeleting"
						ref="deleteButtonRef"
						type="button"
						tabindex="0"
						aria-label="Delete message"
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
						<Icon name="bin" class="h-3.5 w-3.5" />
					</button>
					<p v-if="isDeleting" class="whitespace-pre-wrap break-words italic">
						Deleting...
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

				<EmojiTooltip
					ref="emojiTooltipRef"
					:message-id="message.id"
					:current-user-id="currentUserId"
					:grouped-reactions="groupedReactions"
					:user-reactions="userReactions"
					:is-deleting="isDeleting"
					position="right"
					@reaction-click="handleReactionClick"
					@show-change="handleTooltipShowChange"
				/>
			</div>
		</div>

		<Dialog
			:open="showDeleteDialog"
			title="Delete message"
			message="Are you sure you want to delete this message? This operation cannot be undone."
			confirm-text="Delete"
			cancel-text="Cancel"
			@update:open="handleDialogUpdate"
			@confirm="handleConfirmDelete"
			@cancel="handleCancelDelete"
		/>
	</div>
</template>
