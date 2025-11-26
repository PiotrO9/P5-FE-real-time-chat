<script setup lang="ts">
import type { Friend } from '~/types/Chat'

interface Props {
	availableFriends: Friend[]
	isAddingUser: boolean
}

interface Emits {
	(e: 'add-user', username: string): void
	(e: 'add-user-click', friend: Friend): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const addUserUsername = ref('')

function handleAddUser() {
	if (!addUserUsername.value.trim()) return

	emit('add-user', addUserUsername.value.trim())
	addUserUsername.value = ''
}

function handleAddUserClick(friend: Friend) {
	addUserUsername.value = friend.username
	handleAddUser()
}

function handleKeyDown(event: KeyboardEvent) {
	if (event.key === 'Enter') {
		handleAddUser()
	}
}
</script>

<template>
	<div class="p-4 border-b border-t border-gray-200 dark:border-gray-700 dark:bg-gray-900">
		<h3 class="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Add user</h3>
		<div class="space-y-2">
			<label for="add-user-input" class="sr-only">Username</label>
			<input
				id="add-user-input"
				v-model="addUserUsername"
				type="text"
				placeholder="Enter username"
				class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
				@keydown="handleKeyDown"
			/>
			<button
				type="button"
				tabindex="0"
				aria-label="Add user"
				:disabled="props.isAddingUser || !addUserUsername.trim()"
				class="w-full px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
				@click="handleAddUser"
				@keydown.enter="handleAddUser"
			>
				{{ props.isAddingUser ? 'Adding...' : 'Add' }}
			</button>
		</div>

		<div v-if="props.availableFriends.length > 0" class="mt-4">
			<p class="text-xs text-gray-600 dark:text-gray-400 mb-2">Available friends:</p>
			<div class="space-y-1 max-h-32 overflow-y-auto">
				<button
					v-for="friend in props.availableFriends"
					:key="friend.id"
					type="button"
					tabindex="0"
					:aria-label="`Add ${friend.username} to chat`"
					class="w-full text-left px-2 py-1.5 text-xs rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center justify-between"
					@click="handleAddUserClick(friend)"
					@keydown.enter="handleAddUserClick(friend)"
				>
					<span class="font-medium text-gray-900 dark:text-gray-100">
						{{ friend.username }}
					</span>
					<span
						v-if="friend.isOnline"
						class="size-2 rounded-full bg-green-500"
						aria-label="Online"
					></span>
				</button>
			</div>
		</div>
	</div>
</template>
