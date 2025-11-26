<script setup lang="ts">
interface Props {
	chatInitial: string
	isOnline?: boolean
}

const { chatInitial, isOnline } = defineProps<Props>()
</script>

<template>
	<div class="relative">
		<div
			class="size-10 bg-blue-100 flex items-center justify-center text-blue-600 font-bold rounded-full"
		>
			{{ chatInitial }}
		</div>
		<div
			v-if="isOnline"
			class="absolute bottom-0 right-0 size-3.5 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full z-10"
			aria-label="Online"
		></div>
	</div>
</template>
