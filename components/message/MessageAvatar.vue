<script setup lang="ts">
interface Props {
	senderName: string
}

const props = defineProps<Props>()

const avatarInitial = computed(() => {
	const name = props.senderName || '?'
	return name.charAt(0).toUpperCase()
})
</script>

<template>
	<div
		class="h-8 w-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-300 font-semibold flex-shrink-0"
		:aria-label="`Avatar ${senderName}`"
	>
		{{ avatarInitial }}
	</div>
</template>
