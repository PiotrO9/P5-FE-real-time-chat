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

const isOnline = computed(() => {
	if (userData.value.isOnline !== undefined) {
		return userData.value.isOnline
	}

	if (!userData.value.lastSeen) return false

	const lastSeenDate = new Date(userData.value.lastSeen)
	const now = new Date()
	const diffMs = now.getTime() - lastSeenDate.getTime()
	const diffMins = Math.floor(diffMs / 60000)

	return diffMins < 5
})
</script>

<template>
	<div class="flex flex-col">
		<div class="px-4 py-6 border-b border-gray-200 dark:border-gray-700">
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
					<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
						{{ userData.username }}
					</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400 text-center">
						Head Of Design at Logoipsum
					</p>
					<p class="text-sm text-gray-500 dark:text-gray-400">Bangladesh</p>
				</div>
			</div>
		</div>
	</div>
</template>
