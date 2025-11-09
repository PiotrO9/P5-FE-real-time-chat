<script setup lang="ts">
const emit = defineEmits<{
	(e: 'add-friend', username: string): void
}>()

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
	<div class="flex flex-col h-full">
		<div class="p-4 border-b border-gray-200">
			<label for="username-input" class="block text-sm font-medium text-gray-700 mb-2">
				Dodaj znajomego
			</label>
			<div class="flex gap-2">
				<input
					id="username-input"
					v-model="username"
					type="text"
					placeholder="Wpisz nazwę użytkownika..."
					:disabled="isSubmitting"
					@keydown="handleKeyDown"
				/>
				<button
					type="button"
					class="px-4 py-2 bg-blue-500 text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
					tabindex="0"
					aria-label="Wyślij zaproszenie"
					:disabled="!username.trim() || isSubmitting"
					@click="handleSubmit"
				>
					Wyślij
				</button>
			</div>
			<p class="mt-2 text-xs text-gray-500">
				Wpisz nazwę użytkownika, do którego chcesz wysłać zaproszenie do znajomych.
			</p>
		</div>

		<div class="flex-1 overflow-y-auto p-4">
			<div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
				<h4 class="text-sm font-semibold text-blue-900 mb-2">Jak to działa?</h4>
				<ul class="text-xs text-blue-800 space-y-1 list-disc list-inside">
					<li>Wpisz nazwę użytkownika (username) osoby, którą chcesz dodać</li>
					<li>Zostanie wysłane zaproszenie do znajomych</li>
					<li>Osoba otrzyma zaproszenie i będzie mogła je zaakceptować lub odrzucić</li>
					<li>Po akceptacji znajdziesz ją w liście swoich znajomych</li>
				</ul>
			</div>
		</div>
	</div>
</template>
