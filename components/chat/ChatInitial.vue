<script setup lang="ts">
interface Props {
	chatInitial: string
	isOnline?: boolean
}

const { chatInitial, isOnline } = defineProps<Props>()
</script>

<template>
	<div
		class="size-10 bg-blue-100 flex items-center justify-center text-blue-600 font-bold rounded-full"
	>
		{{ chatInitial }}
	</div>
	<div
		v-if="isOnline"
		class="absolute bottom-0 right-0 h-3 w-3 bg-green-500 border-2 border-white rounded-full"
		aria-label="Online"
	></div>
</template>
