<script setup lang="ts">
interface Props {
	classes?: string
}

const { classes = '' } = defineProps<Props>()

const isOpen = ref(false)

function handleToggleState() {
	isOpen.value = !isOpen.value
}
</script>

<template>
	<div
		:class="[
			classes,
			'flex rounded-full size-8 border-gray-400 border-solid border-2 items-center justify-center bg-white hover:bg-gray-100 cursor-pointer'
		]"
		@click="handleToggleState"
	>
		<div class="flex items-center gap-1">
			<Icon name="context-menu-dots" />
		</div>
	</div>
</template>
