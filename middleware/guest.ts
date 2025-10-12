export default defineNuxtRouteMiddleware(async () => {
	// Wykonuj middleware tylko po stronie klienta
	if (import.meta.server) {
		return
	}

	const { isAuthenticated, authInitialized } = useAuth()

	// Czekaj na zakończenie inicjalizacji autoryzacji z pluginu
	if (!authInitialized.value) {
		// Czekaj maksymalnie 5 sekund na inicjalizację
		const startTime = Date.now()
		while (!authInitialized.value && Date.now() - startTime < 5000) {
			await new Promise((resolve) => setTimeout(resolve, 50))
		}
	}

	// Jeśli jest zalogowany, przekieruj na /dashboard
	if (isAuthenticated.value) {
		return navigateTo('/dashboard')
	}
})
