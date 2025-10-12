export function createApiClient() {
	return $fetch.create({
		baseURL: 'http://localhost:3000/api',
		credentials: 'include'
	})
}

// Export singleton instance
export const apiFetch = createApiClient()
