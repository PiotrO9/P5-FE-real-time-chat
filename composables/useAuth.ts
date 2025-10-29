import { storeToRefs } from 'pinia'
import { useAuthStore } from '~/stores/auth'

export function useAuth() {
	const authStore = useAuthStore()
	const { user, isAuthenticated, isInitialized, loading, error } = storeToRefs(authStore)

	return {
		user,
		isAuthenticated,
		isInitialized,
		loading,
		error,
		login: authStore.login,
		register: authStore.register,
		logout: authStore.logout,
		checkAuth: authStore.checkAuth,
		refreshToken: authStore.refreshToken
	}
}
