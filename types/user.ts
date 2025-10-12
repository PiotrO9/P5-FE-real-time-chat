import type { User } from './auth'

export interface UpdateProfileData {
	username?: string
	email?: string
}

export interface UpdatePasswordData {
	currentPassword: string
	newPassword: string
}

export interface UserStatus {
	status: 'online' | 'offline'
}

export interface UsersListResponse {
	users: User[]
	pagination: {
		currentPage: number
		totalPages: number
		totalUsers: number
		hasNext: boolean
		hasPrev: boolean
	}
}

export interface UserProfileResponse {
	user: User
}

export interface UserStatusResponse {
	status: 'online' | 'offline'
}
