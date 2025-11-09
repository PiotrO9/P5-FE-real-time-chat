<script setup lang="ts">
interface Props {
	chatName: string
	isGroupChat?: boolean
}

const props = defineProps<Props>()

interface Emits {
	(e: 'toggle-actions'): void
}

const emit = defineEmits<Emits>()

const chatInitial = computed(() => (props.chatName ?? '').charAt(0) || '?')
const displayName = computed(() => props.chatName ?? 'Czat')

function handleToggleActions() {
	emit('toggle-actions')
}
</script>

<template>
	<div
		class="border-b border-gray-200 px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60"
	>
		<div class="flex items-center gap-3">
			<div
				class="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold"
			>
				{{ chatInitial }}
			</div>
			<h2 class="text-lg font-semibold text-gray-900">
				{{ displayName }}
			</h2>
		</div>
		<button
			v-if="isGroupChat"
			type="button"
			tabindex="0"
			aria-label="Otwórz panel akcji czatu"
			class="p-2 rounded-lg hover:bg-gray-100 transition-colors"
			@click="handleToggleActions"
			@keydown.enter="handleToggleActions"
			@keydown.space.prevent="handleToggleActions"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				class="h-5 w-5 text-gray-600"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				stroke-width="2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
				/>
			</svg>
		</button>
	</div>
</template>
