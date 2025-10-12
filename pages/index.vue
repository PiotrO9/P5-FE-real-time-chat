<script setup lang="ts">
const { checkAuth, isAuthenticated } = useAuth()

const isChecking = ref(true)

onMounted(async () => {
	await checkAuth()
	isChecking.value = false

	if (isAuthenticated.value) {
		await navigateTo('/dashboard')
	} else {
		await navigateTo('/login')
	}
})
</script>

<template>
	<div class="flex items-center justify-center min-h-screen">
		<div class="text-center">
			<div class="flex justify-center items-center mb-4">
				<svg class="animate-spin h-12 w-12 text-blue-600" fill="none" viewBox="0 0 24 24">
					<circle
						class="opacity-25"
						cx="12"
						cy="12"
						r="10"
						stroke="currentColor"
						stroke-width="4"
					/>
					<path
						class="opacity-75"
						fill="currentColor"
						d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
					/>
				</svg>
			</div>
			<h1 class="text-2xl font-bold text-gray-900 mb-2">Real-Time Chat</h1>
			<p class="text-gray-600">Ładowanie...</p>
		</div>
	</div>
</template>
