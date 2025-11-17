<script setup lang="ts">
import type { Message } from '~/types/Chat'
import ReplyPreview from '~/components/message/ReplyPreview.vue'
import MessageAvatar from './MessageAvatar.vue'
import MessageBubble from './MessageBubble.vue'
import MessageActionBar from './MessageActionBar.vue'
import ReactionBadges from './ReactionBadges.vue'

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

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const uiState = reactive({
	showActionBar: false,
	showContextMenu: false,
	isFocused: false,
	isDeleting: false,
	showDeleteDialog: false,
	justClosedDialog: false,
	isEmojiTooltipOpen: false
})

const actionBarRef = ref<InstanceType<typeof MessageActionBar> | null>(null)

const currentUserId = computed(() => user.value?.id ?? 0)
const isOwnMessage = computed(() => String(props.message.senderId) === String(currentUserId.value))
const senderDisplayName = computed(() => {
	if (isOwnMessage.value) return 'You'
	return props.message.senderUsername || 'Unknown'
})
const formattedTime = computed(() => {
	return new Date(props.message.createdAt).toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit'
	})
})
const isEdited = computed(() => props.message.edited === true || !!props.message.editedAt)
const isPinned = computed(() => props.message.isPinned ?? false)
const hasReplyTo = computed(() => !!props.message.replyTo)
const replyToSenderName = computed(() => {
	if (!props.message.replyTo) return ''
	return props.message.replyTo.senderUsername || 'Unknown'
})

const {
	groupedReactions,
	hasReactions,
	hasUserReaction,
	getReactionCount,
	toggleReaction,
	userReactions
} = useMessageReactions(
	computed(() => props.message),
	currentUserId
)

const editState = useMessageEdit(computed(() => props.message))
const { isPinning, togglePin } = useMessagePin(
	computed(() => props.message),
	chatStore
)

const editContent = computed({
	get: () => unref(editState.editContent),
	set: (value: string) => {
		editState.editContent.value = value
	}
})
const isEditing = computed(() => unref(editState.isEditing))
const isUpdating = computed(() => unref(editState.isUpdating))

const shouldShowActionBar = computed(
	() => !uiState.isDeleting && !isEditing.value && (uiState.showActionBar || uiState.isFocused)
)

const actionBarProps = computed(() => ({
	messageId: props.message.id,
	currentUserId: currentUserId.value,
	groupedReactions: groupedReactions.value,
	userReactions: userReactions.value,
	isDeleting: uiState.isDeleting,
	position: (isOwnMessage.value ? 'right' : 'left') as 'left' | 'right',
	isOwnMessage: isOwnMessage.value,
	isPinned: isPinned.value,
	shouldShow: shouldShowActionBar.value,
	showContextMenu: uiState.showContextMenu
}))

function shouldHideActionBar(): boolean {
	if (!actionBarRef.value) return true
	const refs = actionBarRef.value
	const elements = [refs.contextMenuRef?.value, refs.emojiTooltipContainerRef?.value]

	return (
		!elements.some((el) => el?.matches(':hover')) &&
		!uiState.isEmojiTooltipOpen &&
		!uiState.showContextMenu
	)
}

function handleFocus() {
	if (!uiState.isDeleting) {
		uiState.isFocused = true
		uiState.showActionBar = true
	}
}

function handleBlur() {
	uiState.isFocused = false
	uiState.showActionBar = false
}

function handleMessageMouseEnter() {
	if (!uiState.isDeleting && !isEditing.value) {
		uiState.showActionBar = true
	}
}

function handleMessageMouseLeave() {
	if (shouldHideActionBar()) {
		uiState.showActionBar = false
	}
}

function handleActionBarMouseEnter() {
	uiState.showActionBar = true
}

function handleActionBarMouseLeave() {
	if (shouldHideActionBar()) {
		uiState.showActionBar = false
	}
}

function handleTooltipShowChange(show: boolean) {
	uiState.isEmojiTooltipOpen = show
	if (show) {
		uiState.showActionBar = true
	}
}

function handleToggleContextMenu() {
	uiState.showContextMenu = !uiState.showContextMenu

	if (uiState.showContextMenu) {
		uiState.showActionBar = true
	}
}

function handleContextMenuMouseEnter() {
	uiState.showContextMenu = true
}

function handleContextMenuMouseLeave() {
	const containerRef = actionBarRef.value?.emojiTooltipContainerRef?.value
	if (!containerRef?.matches(':hover')) {
		uiState.showContextMenu = false
	}
}

function handleEmojiButtonClick() {
	uiState.showActionBar = true
}

function handleReplyClick() {
	emit('reply', props.message)
}

function handleReplyToClick(event: Event) {
	event.stopPropagation()

	if (props.message.replyTo?.id) {
		emit('scroll-to-message', props.message.replyTo.id)
	}
}

function handleDeleteClick() {
	if (!isOwnMessage.value || uiState.isDeleting || uiState.justClosedDialog) return

	uiState.showContextMenu = false
	uiState.showDeleteDialog = true
}

function handleConfirmDelete() {
	uiState.isDeleting = true
	emit('delete', String(props.message.id))
}

function handleCancelDelete() {}

function resetDialogState() {
	uiState.justClosedDialog = true
	uiState.isFocused = false
	uiState.showActionBar = false

	nextTick(() => {
		setTimeout(() => {
			uiState.justClosedDialog = false
		}, 100)
	})
}

function handleDialogUpdate(open: boolean) {
	uiState.showDeleteDialog = open

	if (!open) {
		resetDialogState()
	}
}

function handleEditTextareaRef(el: HTMLTextAreaElement | null) {
	if (el) editState.editTextareaRef.value = el
}

async function handleReactionClick(emoji: string) {
	const result = await toggleReaction(emoji)

	if (result) {
		emit('reaction-updated', props.message.id, result.emoji, result.action)
	}
}

async function handlePinClick() {
	if (isPinning.value || uiState.isDeleting) return
	uiState.showContextMenu = false

	const newPinState = await togglePin()
	emit('pin-updated', props.message.id, newPinState)
}
</script>

<template>
	<div
		class="w-full flex flex-col group relative"
		:class="isOwnMessage ? 'items-end' : 'items-start'"
		:data-message-id="message.id"
	>
		<div
			v-if="isOwnMessage && hasReplyTo && message.replyTo"
			class="w-full flex -mb-2 justify-end -translate-y-1"
		>
			<ReplyPreview
				:reply-to="message.replyTo"
				:is-own-message="true"
				:reply-to-sender-name="replyToSenderName"
				variant="own"
				@click="handleReplyToClick"
			/>
		</div>

		<div
			class="w-full flex relative z-10"
			:class="isOwnMessage ? 'justify-end' : 'justify-start'"
		>
			<template v-if="!isOwnMessage">
				<div class="flex items-start gap-2 max-w-[85%] relative">
					<MessageAvatar :sender-name="senderDisplayName" />

					<div class="min-w-0 flex-1 flex items-start gap-2">
						<div class="flex-1">
							<p class="text-xs font-medium text-gray-700 mb-1">
								{{ senderDisplayName }}
							</p>

							<ReplyPreview
								v-if="hasReplyTo && message.replyTo"
								:reply-to="message.replyTo"
								:is-own-message="false"
								:reply-to-sender-name="replyToSenderName"
								variant="other"
								class="translate-y-2"
								@click="handleReplyToClick"
							/>

							<div
								class="relative flex items-center gap-2"
								@mouseenter="handleMessageMouseEnter"
								@mouseleave="handleMessageMouseLeave"
							>
								<MessageBubble
									:message="message"
									:is-own-message="false"
									:is-pinned="isPinned"
									:is-deleting="uiState.isDeleting"
									:is-editing="isEditing"
									:edit-content="editContent"
									:is-updating="isUpdating"
									:highlighted="highlighted"
									:sender-display-name="senderDisplayName"
									:formatted-time="formattedTime"
									:is-edited="isEdited"
								/>

								<MessageActionBar
									ref="actionBarRef"
									v-bind="actionBarProps"
									@emoji-click="handleEmojiButtonClick"
									@reply-click="handleReplyClick"
									@context-menu-toggle="handleToggleContextMenu"
									@reaction-click="handleReactionClick"
									@tooltip-show-change="handleTooltipShowChange"
									@mouseenter="handleActionBarMouseEnter"
									@mouseleave="handleActionBarMouseLeave"
									@delete="handleDeleteClick"
									@pin="handlePinClick"
									@context-menu-mouseenter="handleContextMenuMouseEnter"
									@context-menu-mouseleave="handleContextMenuMouseLeave"
								/>
							</div>

							<ReactionBadges
								v-if="hasReactions"
								:grouped-reactions="groupedReactions"
								:has-user-reaction="hasUserReaction"
								:get-reaction-count="getReactionCount"
								alignment="left"
								@reaction-click="handleReactionClick"
							/>
						</div>
					</div>
				</div>
			</template>

			<template v-else>
				<div
					class="flex flex-col items-end max-w-[85%] relative z-1"
					tabindex="0"
					@mouseenter="handleMessageMouseEnter"
					@mouseleave="handleMessageMouseLeave"
					@focusin="handleFocus"
					@focusout="handleBlur"
				>
					<div class="relative flex items-center gap-2">
						<MessageActionBar
							ref="actionBarRef"
							v-bind="actionBarProps"
							@emoji-click="handleEmojiButtonClick"
							@reply-click="handleReplyClick"
							@context-menu-toggle="handleToggleContextMenu"
							@reaction-click="handleReactionClick"
							@tooltip-show-change="handleTooltipShowChange"
							@mouseenter="handleActionBarMouseEnter"
							@mouseleave="handleActionBarMouseLeave"
							@delete="handleDeleteClick"
							@pin="handlePinClick"
							@context-menu-mouseenter="handleContextMenuMouseEnter"
							@context-menu-mouseleave="handleContextMenuMouseLeave"
						/>

						<MessageBubble
							:message="message"
							:is-own-message="true"
							:is-pinned="isPinned"
							:is-deleting="uiState.isDeleting"
							:is-editing="isEditing"
							:edit-content="editContent"
							:is-updating="isUpdating"
							:highlighted="highlighted"
							:sender-display-name="senderDisplayName"
							:formatted-time="formattedTime"
							:is-edited="isEdited"
							:edit-textarea-ref="handleEditTextareaRef"
							@cancel-edit="editState.cancelEdit"
							@save-edit="editState.saveEdit"
							@keydown="editState.handleKeyDown"
							@update:edit-content="(value) => (editContent = value)"
						/>

						<ReactionBadges
							v-if="hasReactions"
							:grouped-reactions="groupedReactions"
							:has-user-reaction="hasUserReaction"
							:get-reaction-count="getReactionCount"
							alignment="right"
							@reaction-click="handleReactionClick"
						/>
					</div>
				</div>
			</template>
		</div>

		<Dialog
			:open="uiState.showDeleteDialog"
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
