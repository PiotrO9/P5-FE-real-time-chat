<script setup lang="ts">
const auth = useAuth()

onMounted(async () => {
	if (!auth.isInitialized.value) {
		await auth.checkAuth()
	}
})
</script>

<template>
	<div class="min-h-screen bg-gray-50">
		<div v-if="!auth.isInitialized.value" class="min-h-screen flex items-center justify-center">
			<div class="text-center">
				<div
					class="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"
				></div>
				<p class="mt-4 text-gray-600">Loading...</p>
			</div>
		</div>

		<NuxtPage v-else />
		<ToastContainer />
	</div>
</template>
