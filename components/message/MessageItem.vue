<script setup lang="ts">
import type { Message, Reaction } from '~/types/Chat'
import {
	addReaction,
	removeReaction,
	pinMessage,
	unpinMessage,
	updateMessage as updateMessageService
} from '~/services/chatService'
import EmojiTooltip from '~/components/ui/EmojiTooltip.vue'

interface GroupedReaction {
	userIds: (string | number)[]
	reactions: Reaction[]
}

interface Props {
	message: Message
	messages?: Message[]
	highlighted?: boolean
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
	(e: 'reply', message: Message): void
	(e: 'scroll-to-message', messageId: string | number): void
}

const { user } = useAuth()
const chatStore = useChatStore()
const { error: toastError } = useToast()

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const showActionBar = ref(false)
const showContextMenu = ref(false)
const isFocused = ref(false)
const isDeleting = ref(false)
const isEditing = ref(false)
const editContent = ref('')
const isUpdating = ref(false)
const showDeleteDialog = ref(false)
const justClosedDialog = ref(false)
const isReacting = ref(false)
const isPinning = ref(false)
const emojiTooltipRef = ref<InstanceType<typeof EmojiTooltip> | null>(null)
const editTextareaRef = ref<HTMLTextAreaElement | null>(null)
const contextMenuRef = ref<HTMLDivElement | null>(null)
const actionBarRef = ref<HTMLDivElement | null>(null)
const emojiTooltipContainerRef = ref<HTMLDivElement | null>(null)
const isSavingEdit = ref(false)
const isEmojiTooltipOpen = ref(false)

const message = computed(() => props.message)
const currentUserId = computed(() => user.value?.id ?? 0)
const isOwnMessage = computed(() => message.value.senderId === currentUserId.value)
const senderDisplayName = computed(() => {
	if (isOwnMessage.value) {
		return 'You'
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
const shouldShowActionBar = computed(
	() => !isDeleting.value && !isEditing.value && (showActionBar.value || isFocused.value)
)
const isEdited = computed(() => message.value.edited === true || !!message.value.editedAt)
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
const hasReplyTo = computed(() => !!message.value.replyTo)

const replyToSenderName = computed(() => {
	if (!message.value.replyTo) return ''

	return message.value.replyTo.senderUsername || 'Unknown'
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
		showActionBar.value = true
	}
}

function handleBlur() {
	isFocused.value = false
	showActionBar.value = false
}

function handleDeleteClick() {
	if (!isOwnMessage.value || isDeleting.value || justClosedDialog.value) return
	showContextMenu.value = false
	showDeleteDialog.value = true
}

function handleConfirmDelete() {
	isDeleting.value = true
	emit('delete', String(message.value.id))
}

function handleCancelDelete() {
	return
}

function resetDialogState() {
	justClosedDialog.value = true
	isFocused.value = false
	showActionBar.value = false

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
	if (!isDeleting.value && !isEditing.value) {
		showActionBar.value = true
	}
}

function handleMessageMouseLeave() {
	if (
		!contextMenuRef.value?.matches(':hover') &&
		!actionBarRef.value?.matches(':hover') &&
		!emojiTooltipContainerRef.value?.matches(':hover') &&
		!isEmojiTooltipOpen.value &&
		!showContextMenu.value
	) {
		showActionBar.value = false
	}
}

function handleActionBarMouseEnter() {
	showActionBar.value = true
}

function handleActionBarMouseLeave() {
	if (
		!contextMenuRef.value?.matches(':hover') &&
		!emojiTooltipContainerRef.value?.matches(':hover') &&
		!isEmojiTooltipOpen.value &&
		!showContextMenu.value
	) {
		showActionBar.value = false
	}
}

function handleTooltipShowChange(show: boolean) {
	isEmojiTooltipOpen.value = show
	if (show) {
		showActionBar.value = true
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
		return
	} finally {
		isReacting.value = false
	}
}

async function handlePinClick() {
	if (isPinning.value || isDeleting.value) return
	showContextMenu.value = false

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
		toastError(errorMessage || 'Failed to update pin status')
	} finally {
		isPinning.value = false
	}
}

function handleContextMenuKeyDown(event: KeyboardEvent, action: 'delete' | 'pin') {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		if (action === 'delete') {
			handleDeleteClick()
		} else if (action === 'pin') {
			handlePinClick()
		}
	}
}

function _handleEditClick() {
	if (!isOwnMessage.value || isDeleting.value || isEditing.value || justClosedDialog.value) return
	showContextMenu.value = false
	isEditing.value = true
	editContent.value = message.value.content
	nextTick(() => {
		editTextareaRef.value?.focus()
		editTextareaRef.value?.select()
	})
}

function handleToggleContextMenu() {
	showContextMenu.value = !showContextMenu.value
	if (showContextMenu.value) {
		showActionBar.value = true
	}
}

function handleContextMenuMouseEnter() {
	showContextMenu.value = true
}

function handleContextMenuMouseLeave() {
	if (!actionBarRef.value?.matches(':hover')) {
		showContextMenu.value = false
	}
}

function handleEmojiButtonClick() {
	showActionBar.value = true
	emojiTooltipRef.value?.showTooltip()
}

function handleReplyClick() {
	emit('reply', message.value)
}

function handleReplyToClick(event: Event) {
	event.stopPropagation()
	if (message.value.replyTo?.id) {
		emit('scroll-to-message', message.value.replyTo.id)
	}
}

function handleCancelEdit() {
	if (isSavingEdit.value) return
	isEditing.value = false
	editContent.value = ''
}

function handleEditKeyDownTextarea(event: KeyboardEvent) {
	if (event.key === 'Escape') {
		event.preventDefault()
		handleCancelEdit()
	} else if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
		event.preventDefault()
		handleSaveEdit()
	}
}

async function handleSaveEdit() {
	if (
		isUpdating.value ||
		!editContent.value.trim() ||
		editContent.value.trim() === message.value.content
	) {
		handleCancelEdit()
		return
	}

	try {
		isSavingEdit.value = true
		isUpdating.value = true
		const res = await updateMessageService(message.value.id, editContent.value.trim())
		const { mapMessageFromBackend } = useMessageHelpers()

		if (res?.data) {
			const updatedMessage = mapMessageFromBackend(res.data)
			message.value.content = updatedMessage.content
			message.value.edited = updatedMessage.edited ?? true
			message.value.editedAt = updatedMessage.editedAt
		}

		isEditing.value = false
		editContent.value = ''
	} catch (error: any) {
		const errorMessage = error?.response?._data?.message || error?.message
		toastError(errorMessage || 'Failed to update message')
	} finally {
		isUpdating.value = false
		isSavingEdit.value = false
	}
}
</script>

<template>
	<div
		class="w-full flex flex-col group relative"
		:class="isOwnMessage ? 'items-end' : 'items-start'"
		:data-message-id="message.id"
	>
		<div
			v-if="hasReplyTo && message.replyTo"
			class="w-full flex -mb-2 -translate-y-1"
			:class="isOwnMessage ? 'justify-end' : 'justify-start'"
		>
			<button
				type="button"
				tabindex="0"
				aria-label="Przejdź do oryginalnej wiadomości"
				class="flex flex-col gap-0.5 max-w-[85%] bg-gray-300 rounded-lg p-2 text-gray-500 hover:text-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 cursor-pointer"
				:class="isOwnMessage ? 'items-end' : 'items-start'"
				@click="handleReplyToClick"
				@keydown="(e) => (e.key === 'Enter' || e.key === ' ') && handleReplyToClick(e)"
			>
				<div class="flex items-center gap-1.5">
					<span class="text-[11px] text-gray-500">
						{{ isOwnMessage ? 'Odpowiedziałeś' : 'Odpowiedział' }}
					</span>
					<span class="text-[11px] font-medium text-gray-600">
						{{ replyToSenderName }}
					</span>
				</div>
				<p
					v-if="message.replyTo.content"
					class="text-[11px] text-gray-500 line-clamp-1 max-w-full break-words"
					:class="isOwnMessage ? 'text-right' : 'text-left'"
				>
					{{ message.replyTo.content }}
				</p>
			</button>
		</div>
		<div
			class="w-full flex relative z-10"
			:class="isOwnMessage ? 'justify-end' : 'justify-start'"
		>
			<div v-if="!isOwnMessage" class="flex items-start gap-2 max-w-[85%] relative">
				<div
					class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold flex-shrink-0"
					:aria-label="`Avatar ${senderDisplayName}`"
				>
					{{ avatarInitial }}
				</div>
				<div class="min-w-0 flex-1 flex items-start gap-2">
					<div class="flex-1">
						<p class="text-xs font-medium text-gray-700 mb-1">
							{{ senderDisplayName }}
						</p>
						<div
							class="relative flex items-center gap-2"
							@mouseenter="handleMessageMouseEnter"
							@mouseleave="handleMessageMouseLeave"
						>
							<div
								class="max-w-full rounded-2xl px-4 py-2 text-sm shadow-sm text-gray-900 border rounded-bl-none relative transition-all duration-300"
								:class="{
									'bg-white border-gray-200': !isPinned,
									'bg-yellow-50 border-yellow-300': isPinned,
									'ring-2 ring-gray-900 ring-offset-2': props.highlighted
								}"
								:aria-label="`Message from ${senderDisplayName}${isPinned ? ' (pinned)' : ''}`"
							>
								<p class="whitespace-pre-wrap break-words">{{ messageContent }}</p>
								<p class="mt-1 text-[10px] opacity-70 flex items-center gap-1">
									{{ formattedTime }}
									<span v-if="isEdited" class="italic opacity-60">(edited)</span>
								</p>
							</div>

							<div
								v-if="shouldShowActionBar"
								ref="actionBarRef"
								class="flex items-center gap-1 transition-opacity duration-200"
								:class="{
									'opacity-100': shouldShowActionBar,
									'opacity-0': !shouldShowActionBar
								}"
								@mouseenter="handleActionBarMouseEnter"
								@mouseleave="handleActionBarMouseLeave"
							>
								<div
									ref="emojiTooltipContainerRef"
									class="relative"
									@mouseenter="handleActionBarMouseEnter"
								>
									<button
										type="button"
										tabindex="0"
										aria-label="Dodaj reakcję"
										class="h-8 w-8 rounded-full bg-white hover:bg-gray-100 border border-gray-300 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 shadow-sm"
										@click.stop="handleEmojiButtonClick"
										@keydown="
											(e) => e.key === 'Enter' && handleEmojiButtonClick()
										"
									>
										<span class="text-base">😊</span>
									</button>
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
								<button
									type="button"
									tabindex="0"
									aria-label="Odpowiedz na wiadomość"
									class="h-8 w-8 rounded-full bg-white hover:bg-gray-100 border border-gray-300 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 shadow-sm"
									@click.stop="handleReplyClick"
									@keydown="
										(e) =>
											(e.key === 'Enter' || e.key === ' ') &&
											handleReplyClick()
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
										@click.stop="handleToggleContextMenu"
										@keydown="
											(e) =>
												(e.key === 'Enter' || e.key === ' ') &&
												handleToggleContextMenu()
										"
									>
										<Icon name="context-menu-dots" class="h-4 w-4" />
									</button>
									<div
										v-if="showContextMenu"
										ref="contextMenuRef"
										class="absolute bottom-full left-0 mb-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-40 overflow-hidden"
										@mouseenter="handleContextMenuMouseEnter"
										@mouseleave="handleContextMenuMouseLeave"
									>
										<button
											v-if="isOwnMessage"
											type="button"
											tabindex="0"
											aria-label="Usuń wiadomość"
											class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
											@click.stop="handleDeleteClick"
											@keydown="(e) => handleContextMenuKeyDown(e, 'delete')"
										>
											Usuń
										</button>
										<button
											type="button"
											tabindex="0"
											:aria-label="
												isPinned
													? 'Odepnij wiadomość'
													: 'Przypnij wiadomość'
											"
											class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
											@click.stop="handlePinClick"
											@keydown="(e) => handleContextMenuKeyDown(e, 'pin')"
										>
											{{ isPinned ? 'Odepnij' : 'Przypnij' }}
										</button>
									</div>
								</div>
							</div>
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
					</div>
				</div>
			</div>

			<div
				v-else
				class="flex flex-col items-end max-w-[85%] relative z-1"
				tabindex="0"
				@mouseenter="handleMessageMouseEnter"
				@mouseleave="handleMessageMouseLeave"
				@focusin="handleFocus"
				@focusout="handleBlur"
			>
				<div class="relative flex items-center gap-2">
					<div
						v-if="shouldShowActionBar"
						ref="actionBarRef"
						class="flex items-center gap-1 transition-opacity duration-200"
						:class="{
							'opacity-100': shouldShowActionBar,
							'opacity-0': !shouldShowActionBar
						}"
						@mouseenter="handleActionBarMouseEnter"
						@mouseleave="handleActionBarMouseLeave"
					>
						<div
							ref="emojiTooltipContainerRef"
							class="relative"
							@mouseenter="handleActionBarMouseEnter"
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
						<button
							type="button"
							tabindex="0"
							aria-label="Odpowiedz na wiadomość"
							class="h-8 w-8 rounded-full bg-white hover:bg-gray-100 border border-gray-300 flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1 shadow-sm"
							@click.stop="handleReplyClick"
							@keydown="
								(e) => (e.key === 'Enter' || e.key === ' ') && handleReplyClick()
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
								@click.stop="handleToggleContextMenu"
								@keydown="
									(e) =>
										(e.key === 'Enter' || e.key === ' ') &&
										handleToggleContextMenu()
								"
							>
								<Icon name="context-menu-dots" class="h-4 w-4" />
							</button>
							<div
								v-if="showContextMenu"
								ref="contextMenuRef"
								class="absolute bottom-full right-0 mb-1 bg-white rounded-lg shadow-lg border border-gray-200 z-50 min-w-40 overflow-hidden"
								@mouseenter="handleContextMenuMouseEnter"
								@mouseleave="handleContextMenuMouseLeave"
							>
								<button
									v-if="isOwnMessage"
									type="button"
									tabindex="0"
									aria-label="Usuń wiadomość"
									class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
									@click.stop="handleDeleteClick"
									@keydown="(e) => handleContextMenuKeyDown(e, 'delete')"
								>
									Usuń
								</button>
								<button
									type="button"
									tabindex="0"
									:aria-label="
										isPinned ? 'Odepnij wiadomość' : 'Przypnij wiadomość'
									"
									class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-blue-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset"
									@click.stop="handlePinClick"
									@keydown="(e) => handleContextMenuKeyDown(e, 'pin')"
								>
									{{ isPinned ? 'Odepnij' : 'Przypnij' }}
								</button>
							</div>
						</div>
					</div>

					<div
						class="relative rounded-2xl px-4 py-2 text-sm shadow-sm rounded-br-none transition-all duration-300"
						:class="{
							'opacity-50': isDeleting,
							'bg-blue-600 text-white': !isPinned,
							'bg-yellow-500 text-white': isPinned,
							'ring-2 ring-gray-900 ring-offset-2': props.highlighted
						}"
						:aria-label="
							isDeleting
								? 'Deleting message...'
								: `Message from you${isPinned ? ' (pinned)' : ''}`
						"
					>
						<p v-if="isDeleting" class="whitespace-pre-wrap break-words italic">
							Deleting...
						</p>
						<template v-else-if="isEditing">
							<textarea
								ref="editTextareaRef"
								v-model="editContent"
								:disabled="isUpdating"
								class="w-full bg-transparent text-white placeholder-white/70 resize-none focus:outline-none focus:ring-0 border-none p-0 m-0"
								rows="3"
								aria-label="Edit message"
								@keydown="handleEditKeyDownTextarea"
								@blur="handleCancelEdit"
							/>
							<div class="mt-2 flex items-center gap-2 justify-end">
								<button
									type="button"
									tabindex="0"
									aria-label="Cancel edit"
									class="px-3 py-1 text-xs bg-white/20 hover:bg-white/30 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
									@mousedown.prevent
									@click.stop="handleCancelEdit"
									@keydown="(e) => e.key === 'Enter' && handleCancelEdit()"
								>
									Cancel
								</button>
								<button
									type="button"
									tabindex="0"
									aria-label="Save changes"
									:disabled="
										isUpdating ||
										!editContent.trim() ||
										editContent.trim() === message.content
									"
									class="px-3 py-1 text-xs bg-white text-blue-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-blue-600"
									@mousedown.prevent
									@click.stop="handleSaveEdit"
									@keydown="(e) => e.key === 'Enter' && handleSaveEdit()"
								>
									{{ isUpdating ? 'Saving...' : 'Save' }}
								</button>
							</div>
						</template>
						<template v-else>
							<p class="whitespace-pre-wrap break-words">{{ messageContent }}</p>
							<p class="mt-1 text-[10px] opacity-70 flex items-center gap-1">
								{{ formattedTime }}
								<span v-if="isEdited" class="italic opacity-60">(edited)</span>
							</p>
						</template>
					</div>

					<div v-if="hasReactions" class="flex flex-wrap gap-1 mt-1 px-1 justify-end">
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
				</div>
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
