<script setup lang="ts">
interface Props {
	chatInitial: string
}

const { chatInitial } = defineProps<Props>()
</script>

<template>
	<div
		class="size-10 bg-blue-100 flex items-center justify-center text-blue-600 font-bold rounded-full"
	>
		{{ chatInitial }}
	</div>
</template>
