<script setup lang="ts">
interface Emits {
	(e: 'add-friend', username: string): void
}

const emit = defineEmits<Emits>()

const username = ref('')
const isSubmitting = ref(false)

function handleSubmit() {
	const trimmedUsername = username.value.trim()
	if (!trimmedUsername) {
		return
	}

	isSubmitting.value = true
	emit('add-friend', trimmedUsername)
	username.value = ''

	setTimeout(() => {
		isSubmitting.value = false
	}, 500)
}

function handleKeyDown(event: KeyboardEvent) {
	if (event.key === 'Enter') {
		event.preventDefault()
		handleSubmit()
	}
}
</script>

<template>
	<div class="flex flex-col h-full bg-white dark:bg-gray-900 rounded-b-[1.125rem]">
		<div class="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
			<label
				for="username-input"
				class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
			>
				Add friend
			</label>
			<div class="flex gap-2">
				<input
					id="username-input"
					v-model="username"
					type="text"
					placeholder="Enter username..."
					class="flex-1 min-w-0 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
					:disabled="isSubmitting"
					@keydown="handleKeyDown"
				/>
				<button
					type="button"
					class="px-3 md:px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
					tabindex="0"
					aria-label="Send invitation"
					:disabled="!username.trim() || isSubmitting"
					@click="handleSubmit"
				>
					<span class="hidden sm:inline">Send</span>
					<span class="sm:hidden">+</span>
				</button>
			</div>
			<p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
				Enter the username of the person you want to send a friend invitation to.
			</p>
		</div>

		<div class="flex-1 overflow-y-auto px-4 py-4">
			<div
				class="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4"
			>
				<h4 class="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
					How it works?
				</h4>
				<ul
					class="text-xs text-blue-800 dark:text-blue-300 space-y-1 list-disc list-inside"
				>
					<li>Enter the username of the person you want to add</li>
					<li>A friend invitation will be sent</li>
					<li>The person will receive the invitation and can accept or reject it</li>
					<li>After acceptance, you'll find them in your friends list</li>
				</ul>
			</div>
		</div>
	</div>
</template>
