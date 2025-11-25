<script setup lang="ts">
import type { User } from '~/types/Chat'

interface Props {
	user: User
}

const props = defineProps<Props>()

const userData = computed(() => props.user)
const activeTab = ref<'photos' | 'files'>('photos')

function getInitials(username: string): string {
	return username
		.split(' ')
		.map((name) => name[0])
		.join('')
		.toUpperCase()
		.slice(0, 2)
}

function getLocalTime(): string {
	const now = new Date()
	const timezoneOffset = now.getTimezoneOffset()
	const localHours = now.getHours()
	const localMinutes = now.getMinutes()

	const minutes = localMinutes.toString().padStart(2, '0')
	const period = localHours >= 12 ? 'PM' : 'AM'
	const displayHours = localHours > 12 ? localHours - 12 : localHours === 0 ? 12 : localHours
	const timezone = `UTC ${timezoneOffset > 0 ? '-' : '+'}${Math.abs(timezoneOffset / 60)
		.toString()
		.padStart(2, '0')}:00`

	return `Local Time ${displayHours}:${minutes}${period} (${timezone})`
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

const localTime = computed(() => getLocalTime())

function handleTabClick(tab: 'photos' | 'files') {
	activeTab.value = tab
}
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
					<h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">{{ userData.username }}</h3>
					<p class="text-sm text-gray-500 dark:text-gray-400 text-center">Head Of Design at Logoipsum</p>
					<p class="text-sm text-gray-500 dark:text-gray-400">Bangladesh</p>
					<p class="text-xs text-gray-400 dark:text-gray-500">{{ localTime }}</p>
				</div>
			</div>
		</div>

		<div class="border-b border-gray-200 dark:border-gray-700">
			<div class="flex border-b border-gray-200 dark:border-gray-700">
				<button
					type="button"
					tabindex="0"
					aria-label="Photos tab"
					:class="[
						'flex-1 px-4 py-3 text-sm font-medium transition-colors',
						activeTab === 'photos'
							? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
							: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
					]"
					@click="handleTabClick('photos')"
					@keydown.enter="handleTabClick('photos')"
					@keydown.space.prevent="handleTabClick('photos')"
				>
					Photos
				</button>
				<button
					type="button"
					tabindex="0"
					aria-label="Files tab"
					:class="[
						'flex-1 px-4 py-3 text-sm font-medium transition-colors',
						activeTab === 'files'
							? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
							: 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
					]"
					@click="handleTabClick('files')"
					@keydown.enter="handleTabClick('files')"
					@keydown.space.prevent="handleTabClick('files')"
				>
					Files
				</button>
			</div>

			<div v-if="activeTab === 'photos'" class="p-4">
				<div class="grid grid-cols-3 gap-2">
					<div
						v-for="i in 10"
						:key="i"
						class="aspect-square bg-gradient-to-br from-gray-200 dark:from-gray-700 to-gray-300 dark:to-gray-800 rounded-lg flex items-center justify-center"
					>
						<span class="text-xs text-gray-500 dark:text-gray-400">{{ i }}</span>
					</div>
				</div>
			</div>

			<div v-else class="p-4">
				<div class="text-center py-8">
					<p class="text-sm text-gray-500 dark:text-gray-400">No files shared</p>
				</div>
			</div>
		</div>
	</div>
</template>
