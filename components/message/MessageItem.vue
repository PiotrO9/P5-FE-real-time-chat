<script setup lang="ts">
import type { Message } from '~/types/Chat';
import ReplyPreview from '~/components/message/ReplyPreview.vue';
import MessageAvatar from './MessageAvatar.vue';
import MessageBubble from './MessageBubble.vue';
import MessageActionBar from './MessageActionBar.vue';
import ReactionBadges from './ReactionBadges.vue';
import MessageReadsIndicator from './MessageReadsIndicator.vue';
import ForwardMessageDialog from './ForwardMessageDialog.vue';

interface Props {
    message: Message;
    messages?: Message[];
    highlighted?: boolean;
    availableChats?: any[];
}

interface Emits {
    (e: 'delete' | 'scroll-to-message', messageId: string | number): void;
    (
        e: 'reaction-updated',
        messageId: string | number,
        emoji: string,
        action: 'add' | 'remove',
    ): void;
    (e: 'pin-updated', messageId: string | number, isPinned: boolean): void;
    (e: 'reply', message: Message): void;
    (e: 'forward-message', targetChatId: string, messageId: string | number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();
const { user } = useAuth();
const chatStore = useChatStore();

const availableChats = computed(() => props.availableChats || []);

const uiState = reactive({
    showActionBar: false,
    showContextMenu: false,
    isFocused: false,
    isDeleting: false,
    showDeleteDialog: false,
    showForwardDialog: false,
    justClosedDialog: false,
    isEmojiTooltipOpen: false,
    isContextMenuActionExecuting: false,
});

const actionBarRef = ref<InstanceType<typeof MessageActionBar> | null>(null);

const currentUserId = computed(() => user.value?.id ?? 0);
const messageRef = computed(() => props.message);
const { isOwnMessage, senderDisplayName } = useMessageOwnership(messageRef, currentUserId);
const { formatMessageTime } = useMessageHelpers();
const formattedTime = computed(() => formatMessageTime(props.message.createdAt));
const isDeleted = computed(() => props.message.isDeleted === true);
const isEdited = computed(() => props.message.edited === true || !!props.message.editedAt);
const isPinned = computed(() => props.message.isPinned ?? false);
const hasReplyTo = computed(() => !!props.message.replyTo);

watch(isDeleted, (newValue) => {
    if (newValue && uiState.isDeleting) {
        uiState.isDeleting = false;
        uiState.showDeleteDialog = false;
        resetDialogState();
    }
});
const replyToSenderName = computed(() => {
    if (!props.message.replyTo) return '';

    return props.message.replyTo.senderUsername || 'Unknown';
});

const {
    groupedReactions,
    hasReactions,
    hasUserReaction,
    getReactionCount,
    toggleReaction,
    userReactions,
} = useMessageReactions(
    computed(() => props.message),
    currentUserId,
);

const editState = useMessageEdit(computed(() => props.message));
const { isPinning, togglePin } = useMessagePin(
    computed(() => props.message),
    chatStore,
);

const editContent = computed({
    get: () => unref(editState.editContent),
    set: (value: string) => {
        editState.editContent.value = value;
    },
});
const isEditing = computed(() => unref(editState.isEditing));
const isUpdating = computed(() => unref(editState.isUpdating));

const shouldShowActionBar = computed(
    () =>
        !isDeleted.value &&
        !uiState.isDeleting &&
        !isEditing.value &&
        (uiState.showActionBar || uiState.isFocused),
);

const actionBarProps = computed(() => ({
    messageId: props.message.id,
    currentUserId: currentUserId.value,
    groupedReactions: groupedReactions.value,
    userReactions: userReactions.value,
    isDeleting: uiState.isDeleting,
    isDeleted: isDeleted.value,
    position: (isOwnMessage.value ? 'right' : 'left') as 'left' | 'right',
    isOwnMessage: isOwnMessage.value,
    isPinned: isPinned.value,
    shouldShow: shouldShowActionBar.value,
    showContextMenu: uiState.showContextMenu,
}));

function shouldHideActionBar(): boolean {
    if (!actionBarRef.value) return true;

    const refs = actionBarRef.value;
    const elements = [refs.contextMenuRef, refs.emojiTooltipContainerRef];

    return (
        !elements.some((el) => el?.matches(':hover')) &&
        !uiState.isEmojiTooltipOpen &&
        !uiState.showContextMenu
    );
}

function handleFocus() {
    if (!isDeleted.value && !uiState.isDeleting) {
        uiState.isFocused = true;
        uiState.showActionBar = true;
    }
}

function handleBlur() {
    uiState.isFocused = false;
    uiState.showActionBar = false;
}

function handleMessageMouseEnter() {
    if (!isDeleted.value && !uiState.isDeleting && !isEditing.value) {
        uiState.showActionBar = true;
    }
}

function handleMessageMouseLeave() {
    if (shouldHideActionBar()) {
        uiState.showActionBar = false;
    }
}

function handleActionBarMouseEnter() {
    uiState.showActionBar = true;
}

function handleActionBarMouseLeave() {
    if (shouldHideActionBar()) {
        uiState.showActionBar = false;
    }
}

function handleTooltipShowChange(show: boolean) {
    uiState.isEmojiTooltipOpen = show;

    if (show) {
        uiState.showActionBar = true;
    }
}

function handleToggleContextMenu() {
    uiState.showContextMenu = !uiState.showContextMenu;

    if (uiState.showContextMenu) {
        uiState.showActionBar = true;
    }
}

function handleContextMenuMouseEnter() {
    if (contextMenuLeaveTimeout) {
        clearTimeout(contextMenuLeaveTimeout);
        contextMenuLeaveTimeout = null;
    }

    uiState.showContextMenu = true;
}

let contextMenuLeaveTimeout: ReturnType<typeof setTimeout> | null = null;

function handleContextMenuMouseLeave() {
    if (uiState.isContextMenuActionExecuting) return;

    const containerRef = actionBarRef.value?.emojiTooltipContainerRef;

    if (!containerRef?.matches(':hover')) {
        contextMenuLeaveTimeout = setTimeout(() => {
            if (!uiState.isContextMenuActionExecuting) {
                uiState.showContextMenu = false;
            }

            contextMenuLeaveTimeout = null;
        }, 100);
    }
}

function handleEmojiButtonClick() {
    uiState.showActionBar = true;
}

function handleReplyClick() {
    if (isDeleted.value) return;

    emit('reply', props.message);
}

function handleReplyToClick(event: Event) {
    event.stopPropagation();

    if (props.message.replyTo?.id) {
        emit('scroll-to-message', props.message.replyTo.id);
    }
}

function handleDeleteClick() {
    if (!isOwnMessage.value || isDeleted.value || uiState.isDeleting || uiState.justClosedDialog)
        return;

    uiState.isContextMenuActionExecuting = true;
    uiState.showContextMenu = false;

    nextTick(() => {
        uiState.showDeleteDialog = true;
        uiState.isContextMenuActionExecuting = false;
    });
}

function handleConfirmDelete() {
    uiState.isDeleting = true;
    emit('delete', String(props.message.id));
}

function handleCancelDelete() {}

function resetDialogState() {
    uiState.justClosedDialog = true;
    uiState.isFocused = false;
    uiState.showActionBar = false;

    nextTick(() => {
        setTimeout(() => {
            uiState.justClosedDialog = false;
        }, 100);
    });
}

function handleDialogUpdate(open: boolean) {
    uiState.showDeleteDialog = open;

    if (!open) {
        resetDialogState();
    }
}

function handleEditTextareaRef(el: HTMLTextAreaElement | null) {
    if (el) editState.editTextareaRef.value = el;
}

async function handleReactionClick(emoji: string) {
    if (isDeleted.value) return;

    const result = await toggleReaction(emoji);

    if (result) {
        emit('reaction-updated', props.message.id, result.emoji, result.action);
    }
}

async function handlePinClick() {
    if (isDeleted.value || isPinning.value || uiState.isDeleting) return;

    uiState.isContextMenuActionExecuting = true;
    uiState.showContextMenu = false;

    const newPinState = await togglePin();

    emit('pin-updated', props.message.id, newPinState);

    nextTick(() => {
        uiState.isContextMenuActionExecuting = false;
    });
}

function handleForwardClick() {
    if (isDeleted.value || uiState.isDeleting) return;

    uiState.isContextMenuActionExecuting = true;
    uiState.showContextMenu = false;

    nextTick(() => {
        uiState.showForwardDialog = true;
        uiState.isContextMenuActionExecuting = false;
    });
}

function handleForwardDialogUpdate(open: boolean) {
    uiState.showForwardDialog = open;

    if (!open) {
        resetDialogState();
    }
}

function handleSelectChatForForward(chatId: string) {
    emit('forward-message', chatId, props.message.id);
    uiState.showForwardDialog = false;
}
</script>

<template>
    <div
        class="group relative flex w-full flex-col"
        :class="isOwnMessage ? 'items-end' : 'items-start'"
        :data-message-id="message.id"
    >
        <div
            v-if="isOwnMessage && hasReplyTo && message.replyTo"
            class="-mb-2 flex w-full -translate-y-1 justify-end"
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
            class="relative z-10 flex w-full"
            :class="isOwnMessage ? 'justify-end' : 'justify-start'"
        >
            <template v-if="!isOwnMessage">
                <div class="relative flex max-w-[90%] items-start gap-2 md:max-w-[85%]">
                    <MessageAvatar :sender-name="senderDisplayName" />

                    <div class="flex min-w-0 flex-1 items-start gap-2">
                        <div class="flex-1">
                            <p class="mb-1 text-xs font-medium text-gray-700 dark:text-gray-300">
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
                                    @forward="handleForwardClick"
                                    @context-menu-mouseenter="handleContextMenuMouseEnter"
                                    @context-menu-mouseleave="handleContextMenuMouseLeave"
                                />
                            </div>

                            <ReactionBadges
                                v-if="hasReactions && !isDeleted"
                                :grouped-reactions="groupedReactions"
                                :has-user-reaction="hasUserReaction"
                                :get-reaction-count="getReactionCount"
                                alignment="left"
                                @reaction-click="handleReactionClick"
                            />
                            <p
                                v-if="!isDeleted"
                                class="mt-1 flex items-center gap-1 text-[10px] text-gray-600 opacity-70 dark:text-gray-400 dark:opacity-80"
                            >
                                {{ formattedTime }}
                                <span v-if="isEdited" class="italic opacity-60 dark:opacity-70"
                                    >(edited)</span
                                >
                            </p>
                        </div>
                    </div>
                </div>
            </template>

            <template v-else>
                <div
                    class="z-1 relative flex max-w-[90%] flex-col items-end md:max-w-[85%]"
                    tabindex="0"
                    @mouseenter="handleMessageMouseEnter"
                    @mouseleave="handleMessageMouseLeave"
                    @focusin="handleFocus"
                    @focusout="handleBlur"
                >
                    <div class="relative flex flex-col">
                        <div class="flex items-center gap-2">
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
                                @forward="handleForwardClick"
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
                                :edit-textarea-ref="handleEditTextareaRef"
                                @cancel-edit="editState.cancelEdit"
                                @save-edit="editState.saveEdit"
                                @keydown="editState.handleKeyDown"
                                @update:edit-content="(value) => (editContent = value)"
                            />
                        </div>
                        <ReactionBadges
                            v-if="hasReactions && !isDeleted"
                            :grouped-reactions="groupedReactions"
                            :has-user-reaction="hasUserReaction"
                            :get-reaction-count="getReactionCount"
                            alignment="right"
                            @reaction-click="handleReactionClick"
                        />
                    </div>
                    <MessageReadsIndicator
                        v-if="isOwnMessage && message.reads && message.reads.length > 0"
                        :reads="message.reads"
                        :max-visible="3"
                    />
                    <p
                        v-if="!isDeleted"
                        class="mt-1 flex items-center gap-1 text-[10px] text-gray-600 opacity-70 dark:text-gray-400 dark:opacity-80"
                        :class="isOwnMessage ? 'items-end' : 'items-start'"
                    >
                        {{ formattedTime }}
                        <span v-if="isEdited" class="italic opacity-60 dark:opacity-70"
                            >(edited)</span
                        >
                    </p>
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

        <ForwardMessageDialog
            v-if="uiState.showForwardDialog"
            :open="uiState.showForwardDialog"
            :chats="availableChats"
            :current-chat-id="props.message.chatId"
            @update:open="handleForwardDialogUpdate"
            @select-chat="handleSelectChatForForward"
        />
    </div>
</template>
