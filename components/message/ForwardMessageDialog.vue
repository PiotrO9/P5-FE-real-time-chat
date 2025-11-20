<script setup lang="ts">
import type { Chat } from '~/types/Chat'
import ChatItem from '~/components/chat/ChatItem.vue'
import { compareIds } from '~/utils/idHelpers'

interface Props {
	open: boolean
	chats: Chat[]
	currentChatId: string | null
}

interface Emits {
	(e: 'update:open', value: boolean): void
	(e: 'select-chat', chatId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const searchQuery = ref('')
const dialogRef = ref<HTMLDialogElement | null>(null)

const filteredChats = computed(() => {
	if (!props.chats || props.chats.length === 0) {
		return []
	}

	const query = searchQuery.value.trim().toLowerCase()

	if (query.length === 0) {
		return props.chats.filter(
			(chat) => !props.currentChatId || !compareIds(chat.id, props.currentChatId)
		)
	}

	return props.chats.filter(
		(chat) =>
			(!props.currentChatId || !compareIds(chat.id, props.currentChatId)) &&
			chat.name.toLowerCase().includes(query)
	)
})

watch(
	() => props.open,
	(newValue) => {
		if (!dialogRef.value) return

		if (newValue) {
			nextTick(() => {
				if (dialogRef.value) {
					dialogRef.value.showModal()
					searchQuery.value = ''
				}
			})
		} else {
			dialogRef.value.close()
		}
	},
	{ immediate: true }
)

function handleSelectChat(chatId: string) {
	emit('select-chat', chatId)
	emit('update:open', false)
}

function handleCancel() {
	emit('update:open', false)
}

function handleKeyDown(event: KeyboardEvent) {
	if (event.key === 'Escape') {
		event.preventDefault()
		handleCancel()
	}
}

function handleBackdropClick(event: MouseEvent) {
	if (!dialogRef.value) return

	if (event.target === dialogRef.value) {
		handleCancel()
	}
}

onMounted(() => {
	if (props.open && dialogRef.value) {
		dialogRef.value.showModal()
	}
})
</script>

<template>
	<Teleport to="body">
		<dialog
			v-show="open"
			ref="dialogRef"
			class="dialog-content backdrop:bg-black backdrop:bg-opacity-50 backdrop:backdrop-blur-sm rounded-xl border-0 p-0 max-w-md w-full bg-white shadow-2xl"
			aria-labelledby="forward-dialog-title"
			aria-describedby="forward-dialog-description"
			@keydown="handleKeyDown"
			@click="handleBackdropClick"
		>
			<div class="p-6 flex flex-col max-h-[80vh]">
				<header class="mb-4">
					<h2 id="forward-dialog-title" class="text-xl font-semibold text-gray-900 mb-2">
						Przekaż wiadomość
					</h2>
					<p id="forward-dialog-description" class="text-sm text-gray-600">
						Wybierz czat, do którego chcesz przekazać wiadomość
					</p>
				</header>

				<div class="mb-4">
					<input
						v-model="searchQuery"
						type="text"
						placeholder="Szukaj czatu..."
						class="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						aria-label="Szukaj czatu"
					/>
				</div>

				<div class="flex-1 overflow-y-auto mb-4">
					<div v-if="filteredChats.length === 0" class="p-8 text-center">
						<p class="text-gray-500 text-sm">
							{{ searchQuery ? 'Nie znaleziono czatów' : 'Brak dostępnych czatów' }}
						</p>
					</div>
					<ul
						v-else
						class="divide-y divide-gray-100"
						role="listbox"
						aria-label="Lista czatów"
					>
						<li
							v-for="chat in filteredChats"
							:key="chat.id"
							role="option"
							:aria-selected="false"
						>
							<button
								type="button"
								tabindex="0"
								class="w-full text-left"
								:aria-label="`Przekaż do: ${chat.name}`"
								@click="handleSelectChat(chat.id)"
								@keydown="(e) => e.key === 'Enter' && handleSelectChat(chat.id)"
							>
								<ChatItem
									:chat="chat"
									:is-selected="false"
									:typing-users="[]"
									@select="handleSelectChat"
								/>
							</button>
						</li>
					</ul>
				</div>

				<footer class="flex justify-end gap-3">
					<button
						type="button"
						tabindex="0"
						class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-500 focus-visible:ring-offset-2 transition-colors duration-150"
						aria-label="Anuluj"
						@click="handleCancel"
						@keydown="(e) => e.key === 'Enter' && handleCancel()"
					>
						Anuluj
					</button>
				</footer>
			</div>
		</dialog>
	</Teleport>
</template>

<style scoped>
.dialog-content {
	animation: dialog-enter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes dialog-enter {
	from {
		opacity: 0;
		transform: scale(0.9) translateY(-10px);
	}
	to {
		opacity: 1;
		transform: scale(1) translateY(0);
	}
}
</style>
