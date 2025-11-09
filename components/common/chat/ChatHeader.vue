<script setup lang="ts">
import Icon from '../Icon.vue'

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
		class="border-b rounded-t-[1.125rem] border-gray-200 px-6 py-4 flex items-center justify-between bg-white backdrop-blur supports-[backdrop-filter]:bg-white"
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
			<Icon name="context-menu-dots" class="h-5 w-5 text-gray-600" />
		</button>
	</div>
</template>
