<script setup lang="ts">
import Icon from '../Icon.vue'

const isOpen = ref(false)

function handleToggleState() {
	isOpen.value = !isOpen.value
}
</script>

<template>
	<div
		class="chat-item-action-menu hidden rounded-full size-8 border-gray-400 border-solid border-2 items-center justify-center bg-white hover:bg-gray-100"
		@click="handleToggleState"
	>
		<div class="flex items-center gap-1">
			<Icon name="context-menu-dots" class="rotate-180" />
		</div>
	</div>
</template>
