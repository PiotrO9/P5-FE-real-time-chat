import type { $Fetch, FetchOptions } from 'ofetch'

interface RefreshTokenResponse {
	success: boolean
	message: string
}

let isRefreshing = false
let refreshPromise: Promise<boolean> | null = null

async function refreshAccessToken(): Promise<boolean> {
	if (isRefreshing && refreshPromise) {
		return refreshPromise
	}

	isRefreshing = true
	refreshPromise = (async () => {
		try {
			const response = await $fetch<RefreshTokenResponse>(
				'http://localhost:3000/api/auth/refresh',
				{
					method: 'POST',
					credentials: 'include'
				}
			)

			return response.success
		} catch (error) {
			console.error('Token refresh failed:', error)
			return false
		} finally {
			isRefreshing = false
			refreshPromise = null
		}
	})()

	return refreshPromise
}

export function createApiClient(): $Fetch {
	return $fetch.create({
		baseURL: 'http://localhost:3000/api',
		credentials: 'include',

		async onResponseError({ response, options }) {
			if (response.status === 401) {
				const refreshed = await refreshAccessToken()

				if (refreshed) {
					// Spróbuj ponownie oryginalnego requesta
					try {
						return await $fetch(options.baseURL + (options.url || ''), {
							...options,
							credentials: 'include'
						})
					} catch (retryError) {
						console.error('Retry after refresh failed:', retryError)
						await navigateTo('/login')
					}
				} else {
					// Refresh nie powiódł się - przekieruj na login
					await navigateTo('/login')
				}
			}
		}
	})
}

// Export singleton instance
export const apiFetch = createApiClient()
