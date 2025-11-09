export function createApiClient() {
	return $fetch.create({
		baseURL: 'http://localhost:3000/api',
		credentials: 'include'
	})
}

export const apiFetch = createApiClient()
