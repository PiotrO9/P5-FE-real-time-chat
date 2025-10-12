import type { User, LoginCredentials, RegisterData, AuthResponse, MeResponse } from '~/types/auth'
import { apiFetch } from '~/utils/api'

export function useAuth() {
	const user = useState<User | null>('auth-user', () => null)
	const isAuthenticated = computed(() => !!user.value)
	const isLoading = useState<boolean>('auth-loading', () => false)
	const error = useState<string | null>('auth-error', () => null)
	const authChecked = useState<boolean>('auth-checked', () => false)
	const authInitialized = useState<boolean>('auth-initialized', () => false)

	async function login(credentials: LoginCredentials): Promise<boolean> {
		try {
			isLoading.value = true
			error.value = null

			const response = await apiFetch<AuthResponse>('/auth/login', {
				method: 'POST',
				body: credentials
			})

			if (response.success && response.data?.user) {
				user.value = response.data.user
				return true
			}

			return false
		} catch (err: any) {
			error.value = err?.data?.message || 'Błąd logowania'
			console.error('Login error:', err)
			return false
		} finally {
			isLoading.value = false
		}
	}

	async function register(data: RegisterData): Promise<boolean> {
		try {
			isLoading.value = true
			error.value = null

			const response = await apiFetch<AuthResponse>('/auth/register', {
				method: 'POST',
				body: data
			})

			if (response.success) {
				return true
			}

			return false
		} catch (err: any) {
			error.value = err?.data?.message || 'Błąd rejestracji'

			// Obsługa błędów walidacji
			if (err?.data?.details && Array.isArray(err.data.details)) {
				error.value = err.data.details
					.map((d: any) => `${d.field}: ${d.message}`)
					.join(', ')
			}

			console.error('Register error:', err)
			return false
		} finally {
			isLoading.value = false
		}
	}

	async function logout(): Promise<void> {
		try {
			isLoading.value = true
			error.value = null

			await apiFetch('/auth/logout', {
				method: 'POST'
			})

			user.value = null
		} catch (err: any) {
			error.value = err?.data?.message || 'Błąd wylogowania'
			console.error('Logout error:', err)
		} finally {
			isLoading.value = false
		}
	}

	async function checkAuth(): Promise<boolean> {
		try {
			const response = await apiFetch<MeResponse>('/auth/me', {
				method: 'GET'
			})

			if (response.success && response.data?.user) {
				user.value = response.data.user
				authChecked.value = true
				return true
			}

			user.value = null
			authChecked.value = true
			return false
		} catch (err) {
			console.error('[AUTH] ✗ Błąd sprawdzania autoryzacji:', err)
			user.value = null
			authChecked.value = true
			return false
		}
	}

	async function refreshToken(): Promise<boolean> {
		try {
			const response = await apiFetch<{ success: boolean }>('/auth/refresh', {
				method: 'POST'
			})

			return response.success
		} catch (err) {
			console.error('Refresh token error:', err)
			return false
		}
	}

	function clearError(): void {
		error.value = null
	}

	return {
		user,
		isAuthenticated,
		isLoading,
		error,
		authChecked,
		authInitialized,
		login,
		register,
		logout,
		checkAuth,
		refreshToken,
		clearError
	}
}
