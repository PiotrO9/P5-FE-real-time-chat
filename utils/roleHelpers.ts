import type { Role } from '~/types/ChatsApi'

export function getRoleLabel(role: Role): string {
	switch (role) {
		case 'OWNER':
			return 'Owner'
		case 'MODERATOR':
			return 'Moderator'
		case 'MEMBER':
			return 'Member'
		default:
			return 'Member'
	}
}

export function getRoleColor(role: Role): string {
	switch (role) {
		case 'OWNER':
			return 'bg-purple-100 text-purple-700 border-purple-300'
		case 'MODERATOR':
			return 'bg-blue-100 text-blue-700 border-blue-300'
		case 'MEMBER':
			return 'bg-gray-100 text-gray-700 border-gray-300'
		default:
			return 'bg-gray-100 text-gray-700 border-gray-300'
	}
}

export function getAvailableRoles(currentRole: Role): Role[] {
	if (currentRole === 'OWNER') {
		return []
	}

	return ['MEMBER', 'MODERATOR']
}
