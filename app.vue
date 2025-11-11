<script setup lang="ts">
const chatStore = useChatStore()

watch(
	() => chatStore.pinnedMessages,
	() => {
		console.log(chatStore.pinnedMessages)
	},
	{ deep: true }
)
</script>

<template>
	<div class="min-h-screen bg-gray-50">
		<NuxtPage />
		<ToastContainer />
	</div>
</template>
