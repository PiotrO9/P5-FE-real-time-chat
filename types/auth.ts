export interface User {
	id: string
	email: string
	username: string
	createdAt: Date
	lastSeen: Date | null
}

export interface LoginCredentials {
	email: string
	password: string
}

export interface RegisterData {
	email: string
	username: string
	password: string
}

export interface AuthResponse {
	success: boolean
	message: string
	data?: {
		user: User
	}
}

export interface MeResponse {
	success: boolean
	data: {
		user: User
	}
}
