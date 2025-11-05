<script setup lang="ts">
import type { Friend } from '~/types/Chat'

interface Props {
	friends: Friend[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
	'remove-friend': [friendId: string | number]
	'start-chat': [friendId: string | number]
}>()

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
		.map((n) => n[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)
}

function formatLastSeen(lastSeen?: string): string {
	if (!lastSeen) return 'Nigdy'

	const date = new Date(lastSeen)
	const now = new Date()
	const diffMs = now.getTime() - date.getTime()
	const diffMins = Math.floor(diffMs / 60000)

	if (diffMins < 1) return 'Teraz'
	if (diffMins < 60) return `${diffMins} min temu`
	if (diffMins < 1440) return `${Math.floor(diffMins / 60)} godz. temu`

	return date.toLocaleDateString('pl-PL', {
		day: 'numeric',
		month: 'short'
	})
}
</script>

<template>
	<div class="flex-1 overflow-y-auto bg-white">
		<div v-if="friendsList.length === 0" class="p-8 text-center">
			<p class="text-gray-500 text-sm">Nie masz jeszcze żadnych znajomych</p>
			<p class="text-gray-400 text-xs mt-2">Dodaj znajomych, aby zacząć czatować</p>
		</div>
		<ul v-else class="divide-y divide-gray-100" role="listbox" aria-label="Lista znajomych">
			<li
				v-for="friend in friendsList"
				:key="friend.id"
				class="px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors"
				tabindex="0"
				role="option"
				:aria-label="`Znajomy ${friend.username}`"
				@click="handleStartChat(friend.id)"
				@keydown="handleKeyDown($event, friend.id)"
			>
				<div class="flex items-center gap-3">
					<div class="relative flex-shrink-0">
						<div
							class="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-sm"
						>
							{{ getInitials(friend.username) }}
						</div>
						<div
							v-if="friend.isOnline"
							class="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"
							aria-label="Online"
						></div>
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
								aria-label="Usuń znajomego"
								@click.stop="handleRemoveFriend(friend.id, $event)"
								@keydown.enter.stop="handleRemoveFriend(friend.id, $event)"
								@keydown.space.stop="handleRemoveFriend(friend.id, $event)"
							>
								<svg
									class="w-5 h-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</div>
						<p class="text-xs text-gray-500 truncate">
							{{
								friend.isOnline
									? 'Online'
									: `Ostatnio aktywny: ${formatLastSeen(friend.lastSeen)}`
							}}
						</p>
					</div>
				</div>
			</li>
		</ul>
	</div>
</template>
