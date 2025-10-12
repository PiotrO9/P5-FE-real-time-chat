<script setup lang="ts">
const { checkAuth, authChecked, authInitialized } = useAuth()

// Sprawdź autoryzację przed renderowaniem aplikacji (tylko po stronie klienta)
if (import.meta.client && !authChecked.value) {
	await checkAuth()
	authInitialized.value = true
}
</script>

<template>
	<div class="min-h-screen bg-gray-50">
		<NuxtPage />
		<ToastContainer />
	</div>
</template>
