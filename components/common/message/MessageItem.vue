<script setup lang="ts">
import type { Message } from '~/types/Chat'
import Dialog from '~/components/common/Dialog.vue'

interface Props {
	message: Message
}

const props = defineProps<Props>()

interface Emits {
	(e: 'delete', messageId: string | number): void
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

function handleMouseEnter() {
	if (isOwnMessage.value && !isDeleting.value) {
		showDeleteButton.value = true
	}
}

function handleMouseLeave() {
	showDeleteButton.value = false
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
</script>

<template>
	<div class="w-full flex group" :class="isOwnMessage ? 'justify-end' : 'justify-start'">
		<!-- Wiadomości innych użytkowników: awatar + nazwa nadawcy + dymek -->
		<div v-if="!isOwnMessage" class="flex items-start gap-2 max-w-[85%]">
			<div
				class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold flex-shrink-0"
				:aria-label="`Awatar ${senderDisplayName}`"
			>
				{{ avatarInitial }}
			</div>
			<div class="min-w-0">
				<p class="text-xs font-medium text-gray-700 mb-1">
					{{ senderDisplayName }}
				</p>
				<div
					class="max-w-full rounded-2xl px-4 py-2 text-sm shadow-sm bg-white text-gray-900 border border-gray-200 rounded-bl-none"
					:aria-label="`Wiadomość od ${senderDisplayName}`"
				>
					<p class="whitespace-pre-wrap break-words">{{ messageContent }}</p>
					<p class="mt-1 text-[10px] opacity-70">
						{{ formattedTime }}
					</p>
				</div>
			</div>
		</div>

		<!-- Twoje wiadomości: nazwa nadawcy + dymek, wyrównane do prawej -->
		<div
			v-else
			class="flex flex-col items-end max-w-[85%] relative"
			tabindex="0"
			@mouseenter="handleMouseEnter"
			@mouseleave="handleMouseLeave"
			@focusin="handleFocus"
			@focusout="handleBlur"
		>
			<p class="text-xs font-medium text-gray-700 mb-1 mr-2">
				{{ senderDisplayName }}
			</p>
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
				<p v-if="isDeleting" class="whitespace-pre-wrap break-words italic">Usuwanie...</p>
				<template v-else>
					<p class="whitespace-pre-wrap break-words">{{ messageContent }}</p>
					<p class="mt-1 text-[10px] opacity-70">
						{{ formattedTime }}
					</p>
				</template>
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
