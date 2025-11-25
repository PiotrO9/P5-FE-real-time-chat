<script setup lang="ts">
import type { Invite } from '~/types/FriendsApi'
import ChatInitial from '../chat/ChatInitial.vue'

interface Props {
	sentInvites: Invite[]
	receivedInvites: Invite[]
}

interface Emits {
	(e: 'accept-invite', inviteId: string): void
	(e: 'reject-invite', inviteId: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const sentInvites = computed(() => props.sentInvites ?? [])
const receivedInvites = computed(() => props.receivedInvites ?? [])

function handleAccept(inviteId: string) {
	emit('accept-invite', inviteId)
}

function handleReject(inviteId: string) {
	emit('reject-invite', inviteId)
}

function handleKeyDown(event: KeyboardEvent, action: 'accept' | 'reject', inviteId: string) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		if (action === 'accept') {
			handleAccept(inviteId)
		} else {
			handleReject(inviteId)
		}
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

function formatDate(dateString: string): string {
	const date = new Date(dateString)
	return date.toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'short',
		hour: '2-digit',
		minute: '2-digit'
	})
}

function getStatusBadgeClass(status: string): string {
	switch (status) {
		case 'PENDING':
											return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700'
		case 'ACCEPTED':
			return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700'
		case 'REJECTED':
			return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700'
		default:
			return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700'
	}
}

function getStatusText(status: string): string {
	switch (status) {
		case 'PENDING':
			return 'Pending'
		case 'ACCEPTED':
			return 'Accepted'
		case 'REJECTED':
			return 'Rejected'
		default:
			return status
	}
}
</script>

<template>
	<div class="flex flex-col h-full">
		<div class="flex-1 overflow-y-auto">
			<div
				v-if="receivedInvites.length === 0 && sentInvites.length === 0"
				class="p-8 text-center"
			>
				<p class="text-gray-500 dark:text-gray-400 text-sm">No invitations</p>
			</div>

			<div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
				<div v-if="receivedInvites.length > 0" class="pb-4">
					<h3 class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800">
						Received invitations ({{ receivedInvites.length }})
					</h3>
					<ul
						class="divide-y divide-gray-100 dark:divide-gray-800"
						role="listbox"
						aria-label="Received invitations list"
					>
						<li
							v-for="invite in receivedInvites"
							:key="invite.id"
							class="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
							role="option"
							:aria-label="`Invitation from ${invite.sender?.username}`"
						>
							<div class="flex items-center justify-between gap-3">
								<div class="flex items-center gap-3 flex-1 min-w-0">
									<ChatInitial
										:chat-initial="getInitials(invite.sender?.username || '')"
									/>
									<div class="flex-1 min-w-0">
										<p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
											{{ invite.sender?.username }}
										</p>
										<p class="text-xs text-gray-500 dark:text-gray-400 truncate">
											{{ invite.sender?.email }}
										</p>
										<p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
											{{ formatDate(invite.createdAt) }}
										</p>
									</div>
								</div>
								<div class="flex items-center gap-1 md:gap-2 flex-shrink-0">
									<span
										:class="[
											'px-2 py-1 text-xs font-medium rounded-full border hidden sm:inline-block',
											getStatusBadgeClass(invite.status)
										]"
									>
										{{ getStatusText(invite.status) }}
									</span>
									<template v-if="invite.status === 'PENDING'">
										<button
											type="button"
											class="px-2 md:px-3 py-1.5 bg-green-500 dark:bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-600 dark:hover:bg-green-700 transition-colors"
											tabindex="0"
											aria-label="Accept invitation"
											@click="handleAccept(invite.id)"
											@keydown="handleKeyDown($event, 'accept', invite.id)"
										>
											<span class="hidden sm:inline">Accept</span>
											<span class="sm:hidden">✓</span>
										</button>
										<button
											type="button"
											class="px-2 md:px-3 py-1.5 bg-red-500 dark:bg-red-600 text-white text-xs font-medium rounded-lg hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
											tabindex="0"
											aria-label="Reject invitation"
											@click="handleReject(invite.id)"
											@keydown="handleKeyDown($event, 'reject', invite.id)"
										>
											<span class="hidden sm:inline">Reject</span>
											<span class="sm:hidden">×</span>
										</button>
									</template>
								</div>
							</div>
						</li>
					</ul>
				</div>

				<div v-if="sentInvites.length > 0">
					<h3 class="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800">
						Sent invitations ({{ sentInvites.length }})
					</h3>
					<ul
						class="divide-y divide-gray-100 dark:divide-gray-800"
						role="listbox"
						aria-label="Sent invitations list"
					>
						<li
							v-for="invite in sentInvites"
							:key="invite.id"
							class="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
							role="option"
							:aria-label="`Invitation to ${invite.receiver?.username}`"
						>
							<div class="flex items-center justify-between gap-3">
								<div class="flex items-center gap-3 flex-1 min-w-0">
									<ChatInitial
										:chat-initial="getInitials(invite.receiver?.username || '')"
									/>
									<div class="flex-1 min-w-0">
										<p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
											{{ invite.receiver?.username }}
										</p>
										<p class="text-xs text-gray-500 dark:text-gray-400 truncate">
											{{ invite.receiver?.email }}
										</p>
										<p class="text-xs text-gray-400 dark:text-gray-500 mt-1">
											{{ formatDate(invite.createdAt) }}
										</p>
									</div>
								</div>
								<span
									:class="[
										'px-2 py-1 text-xs font-medium rounded-full border',
										getStatusBadgeClass(invite.status)
									]"
								>
									{{ getStatusText(invite.status) }}
								</span>
							</div>
						</li>
					</ul>
				</div>
			</div>
		</div>
	</div>
</template>
