<script setup lang="ts">
import type { Friend } from '~/types/Chat'
import ChatInitial from '../chat/ChatInitial.vue'

interface Props {
	friends: Friend[]
}

interface Emits {
	(e: 'remove-friend', friendId: string | number): void
	(e: 'start-chat', friendId: string | number): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const friendsList = computed(() => props.friends ?? [])

function handleRemoveFriend(friendId: string | number, event: Event) {
	event.stopPropagation()
	emit('remove-friend', friendId)
}

function handleStartChat(friendId: string | number) {
	emit('start-chat', friendId)
}

function handleKeyDown(event: KeyboardEvent, friendId: string | number) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		handleStartChat(friendId)
	}
}

function getInitials(username: string): string {
	return username
		.split(' ')
		.map((name) => name[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)
}

function formatLastSeen(lastSeen?: string): string {
	if (!lastSeen) return 'Never'

	const date = new Date(lastSeen)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffMins = Math.floor(diffMs / 60000)

	if (diffMins < 1) return 'Now'
	if (diffMins < 60) return `${diffMins} min ago`
	if (diffMins < 1440) return `${Math.floor(diffMins / 60)} hrs ago`

	return date.toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'short'
	})
}
</script>

<template>
	<div class="flex-1 overflow-y-auto bg-white rounded-b-[1.125rem] max-h-[calc(100vh-150px)]">
		<div v-if="friendsList.length === 0" class="p-8 text-center">
			<p class="text-gray-500 text-sm">You don't have any friends yet</p>
			<p class="text-gray-400 text-xs mt-2">Add friends to start chatting</p>
		</div>
		<ul v-else class="divide-y divide-gray-100" role="listbox" aria-label="Friends list">
			<li
				v-for="friend in friendsList"
				:key="friend.id"
				class="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
				tabindex="0"
				role="option"
				:aria-label="`Friend ${friend.username}`"
				@click="handleStartChat(friend.id)"
				@keydown="handleKeyDown($event, friend.id)"
			>
				<div class="flex items-center gap-3">
					<div class="relative flex-shrink-0">
						<ChatInitial
							:chat-initial="getInitials(friend.username)"
							:is-online="friend.isOnline"
						/>
					</div>
					<div class="flex-1 min-w-0">
						<div class="flex items-center justify-between">
							<p class="text-sm font-medium text-gray-900 truncate">
								{{ friend.username }}
							</p>
							<button
								type="button"
								class="ml-2 p-1 text-gray-400 hover:text-red-500 transition-colors rounded"
								tabindex="0"
								aria-label="Remove friend"
								@click.stop="handleRemoveFriend(friend.id, $event)"
								@keydown.enter.stop="handleRemoveFriend(friend.id, $event)"
								@keydown.space.stop="handleRemoveFriend(friend.id, $event)"
							>
								<Icon name="remove" class="w-5 h-5" />
							</button>
						</div>
						<p class="text-xs text-gray-500 truncate">
							{{
								friend.isOnline
									? 'Online'
									: `Last active: ${formatLastSeen(friend.lastSeen)}`
							}}
						</p>
					</div>
				</div>
			</li>
		</ul>
	</div>
</template>
