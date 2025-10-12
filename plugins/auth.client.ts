export default defineNuxtPlugin(async () => {
	const { checkAuth, authChecked, authInitialized } = useAuth()

	// Sprawdź autoryzację tylko raz przy inicjalizacji aplikacji
	if (!authChecked.value) {
		await checkAuth()
	}

	// Oznacz że inicjalizacja autoryzacji jest zakończona
	authInitialized.value = true
})
