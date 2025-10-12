import type {
	UpdateProfileData,
	UpdatePasswordData,
	UsersListResponse,
	UserProfileResponse,
	UserStatusResponse
} from '~/types/user'
import type { User } from '~/types/auth'
import { apiFetch } from '~/utils/api'

export function useUser() {
	const isLoading = useState<boolean>('user-loading', () => false)
	const error = useState<string | null>('user-error', () => null)

	async function getUserProfile(id: string): Promise<User | null> {
		try {
			isLoading.value = true
			error.value = null

			const response = await apiFetch<UserProfileResponse>(`/users/${id}`, {
				method: 'GET'
			})

			return response.user
		} catch (err: any) {
			error.value = err?.data?.message || 'Błąd pobierania profilu użytkownika'
			console.error('Get user profile error:', err)
			return null
		} finally {
			isLoading.value = false
		}
	}

	async function getAllUsers(
		page: number = 1,
		limit: number = 10
	): Promise<UsersListResponse | null> {
		try {
			isLoading.value = true
			error.value = null

			const response = await apiFetch<UsersListResponse>('/users', {
				method: 'GET',
				query: { page, limit }
			})

			return response
		} catch (err: any) {
			error.value = err?.data?.message || 'Błąd pobierania listy użytkowników'
			console.error('Get all users error:', err)
			return null
		} finally {
			isLoading.value = false
		}
	}

	async function getUserStatus(id: string): Promise<'online' | 'offline' | null> {
		try {
			const response = await apiFetch<UserStatusResponse>(`/users/${id}/status`, {
				method: 'GET'
			})

			return response.status
		} catch (err: any) {
			error.value = err?.data?.message || 'Błąd pobierania statusu użytkownika'
			console.error('Get user status error:', err)
			return null
		}
	}

	async function updateProfile(id: string, data: UpdateProfileData): Promise<User | null> {
		try {
			isLoading.value = true
			error.value = null

			const response = await apiFetch<{ message: string; user: User }>(`/users/${id}`, {
				method: 'PUT',
				body: data
			})

			return response.user
		} catch (err: any) {
			error.value = err?.data?.message || 'Błąd aktualizacji profilu'

			// Obsługa błędów walidacji
			if (err?.data?.details && Array.isArray(err.data.details)) {
				error.value = err.data.details
					.map((d: any) => `${d.field}: ${d.message}`)
					.join(', ')
			}

			console.error('Update profile error:', err)
			return null
		} finally {
			isLoading.value = false
		}
	}

	async function updatePassword(id: string, data: UpdatePasswordData): Promise<boolean> {
		try {
			isLoading.value = true
			error.value = null

			await apiFetch(`/users/${id}/password`, {
				method: 'PATCH',
				body: data
			})

			return true
		} catch (err: any) {
			error.value = err?.data?.message || 'Błąd zmiany hasła'

			// Obsługa błędów walidacji
			if (err?.data?.details && Array.isArray(err.data.details)) {
				error.value = err.data.details
					.map((d: any) => `${d.field}: ${d.message}`)
					.join(', ')
			}

			console.error('Update password error:', err)
			return false
		} finally {
			isLoading.value = false
		}
	}

	async function deleteUser(id: string): Promise<boolean> {
		try {
			isLoading.value = true
			error.value = null

			await apiFetch(`/users/${id}`, {
				method: 'DELETE'
			})

			return true
		} catch (err: any) {
			error.value = err?.data?.message || 'Błąd usuwania konta'
			console.error('Delete user error:', err)
			return false
		} finally {
			isLoading.value = false
		}
	}

	function clearError(): void {
		error.value = null
	}

	return {
		isLoading,
		error,
		getUserProfile,
		getAllUsers,
		getUserStatus,
		updateProfile,
		updatePassword,
		deleteUser,
		clearError
	}
}
