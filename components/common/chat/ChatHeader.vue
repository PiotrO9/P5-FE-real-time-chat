<script setup lang="ts">
interface Props {
	chatName: string
}

const props = defineProps<Props>()

const chatInitial = computed(() => (props.chatName ?? '').charAt(0) || '?')
const displayName = computed(() => props.chatName ?? 'Czat')
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
	</div>
</template>
