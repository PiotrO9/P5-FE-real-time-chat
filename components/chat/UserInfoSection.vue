<script setup lang="ts">
import type { User } from '~/types/Chat'

interface Props {
	user: User
}

const props = defineProps<Props>()

const userData = computed(() => props.user)

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

function formatCreatedAt(createdAt?: string): string {
	if (!createdAt) return ''

	const date = new Date(createdAt)
	return date.toLocaleDateString('en-US', {
		day: 'numeric',
		month: 'long',
		year: 'numeric'
	})
}

const isOnline = computed(() => {
	// Używamy isOnline z danych jeśli dostępne, w przeciwnym razie sprawdzamy lastSeen
	if (userData.value.isOnline !== undefined) {
		return userData.value.isOnline
	}

	// Fallback: sprawdzamy czy lastSeen jest bardzo świeże (mniej niż 5 minut)
	if (!userData.value.lastSeen) return false

	const lastSeenDate = new Date(userData.value.lastSeen)
	const now = new Date()
	const diffMs = now.getTime() - lastSeenDate.getTime()
	const diffMins = Math.floor(diffMs / 60000)

	return diffMins < 5
})
</script>

<template>
	<div class="px-4 py-6 border-b border-gray-200">
		<div class="flex flex-col items-center gap-4">
			<div class="relative flex-shrink-0">
				<div
					class="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-2xl"
				>
					{{ getInitials(userData.username) }}
				</div>
				<div
					v-if="isOnline"
					class="absolute bottom-0 right-0 h-4 w-4 bg-green-500 border-2 border-white rounded-full"
					aria-label="Online"
				></div>
			</div>

			<div class="flex flex-col items-center gap-2 w-full">
				<h3 class="text-lg font-semibold text-gray-900">{{ userData.username }}</h3>
				<p class="text-sm text-gray-500">{{ userData.email }}</p>
			</div>

			<div class="w-full pt-4 border-t border-gray-100">
				<div class="flex flex-col gap-3">
					<div class="flex items-center justify-between">
						<span class="text-sm text-gray-600">Status</span>
						<span class="text-sm font-medium text-gray-900">
							{{ isOnline ? 'Online' : `Last active: ${formatLastSeen(userData.lastSeen)}` }}
						</span>
					</div>
					<div v-if="userData.createdAt" class="flex items-center justify-between">
						<span class="text-sm text-gray-600">Joined</span>
						<span class="text-sm text-gray-900">{{ formatCreatedAt(userData.createdAt) }}</span>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

