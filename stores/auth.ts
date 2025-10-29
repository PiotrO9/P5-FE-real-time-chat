import { useApi } from '~/composables/useApi'
import type { User } from '~/types/Chat'

export interface ApiResponse<T> {
	data: T
	message?: string
}

export const useAuthStore = defineStore('auth', () => {
	const user = ref<User | null>(null)
	const isAuthenticated = ref(false)
	const isInitialized = ref(false)
	const loading = ref(false)
	const error = ref<string | null>(null)

	async function login(email: string, password: string) {
		try {
			loading.value = true
			error.value = null
			const response = await useApi<ApiResponse<{ user: User }>>('POST', '/api/auth/login', {
				email,
				password
			})
			user.value = response.data.user
			isAuthenticated.value = true
			return response
		} catch (err: any) {
			error.value = err?.message || 'Failed to login'
			isAuthenticated.value = false
			throw err
		} finally {
			loading.value = false
		}
	}

	async function register(email: string, password: string) {
		try {
			loading.value = true
			error.value = null
			return await useApi<ApiResponse<{ user: User }>>('POST', '/api/auth/register', {
				email,
				password
			})
		} catch (err: any) {
			error.value = err?.message || 'Failed to create account'
			throw err
		} finally {
			loading.value = false
		}
	}

	async function logout() {
		try {
			await useApi('POST', '/api/auth/logout')
		} finally {
			isAuthenticated.value = false
			user.value = null
		}
	}

	async function checkAuth() {
		try {
			isInitialized.value = false
			const response = await useApi<ApiResponse<{ user: User }>>('GET', '/api/auth/me')
			user.value = response.data.user
			isAuthenticated.value = true
			return response
		} catch {
			isAuthenticated.value = false
			user.value = null
		} finally {
			isInitialized.value = true
		}
	}

	async function refreshToken() {
		try {
			const response = await useApi<ApiResponse<{ accessToken: string }>>(
				'POST',
				'/api/auth/refresh'
			)
			return response
		} catch (err) {
			error.value = 'Failed to refresh token'
			throw err
		}
	}

	return {
		// state
		user,
		isAuthenticated,
		isInitialized,
		loading,
		error,
		// actions
		login,
		register,
		logout,
		checkAuth,
		refreshToken
	}
})
