<script setup lang="ts">
import type { ChatMember, Role } from '~/types/ChatsApi'
import { getRoleLabel, getRoleColor, getAvailableRoles } from '~/utils/roleHelpers'
import { compareIds } from '~/utils/idHelpers'
import ChatInitial from './ChatInitial.vue'

function getRoleColorDark(role: Role): string {
	switch (role) {
		case 'OWNER':
			return 'dark:bg-purple-900/50 dark:text-purple-200 dark:border-purple-600'
		case 'MODERATOR':
			return 'dark:bg-blue-900/50 dark:text-blue-200 dark:border-blue-600'
		case 'MEMBER':
			return 'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
		default:
			return 'dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600'
	}
}

interface Props {
	member: ChatMember
	currentUserId: number | string
	isOwner: boolean
	openRoleMenuId?: string | null
	isUpdatingRole?: string | null
	isRemovingUser?: string | null
}

interface Emits {
	(e: 'toggle-role-menu', memberId: string, event?: Event): void
	(e: 'change-role', memberId: string, newRole: Role): void
	(e: 'remove-user', userId: string): void
}

const props = withDefaults(defineProps<Props>(), {
	openRoleMenuId: null,
	isUpdatingRole: null,
	isRemovingUser: null
})

const emit = defineEmits<Emits>()

const isMenuOpen = computed(() => props.openRoleMenuId === String(props.member.id))
const isCurrentUser = computed(() => compareIds(props.member.id, props.currentUserId))

function handleToggleRoleMenu(event?: Event) {
	if (event) {
		event.stopPropagation()
		event.preventDefault()
	}
	emit('toggle-role-menu', String(props.member.id), event)
}

function handleChangeRole(newRole: Role) {
	emit('change-role', String(props.member.id), newRole)
}

function handleRemoveUser() {
	emit('remove-user', String(props.member.id))
}
</script>

<template>
	<div
		class="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
	>
		<div class="flex items-center gap-2 flex-1 min-w-0">
			<ChatInitial :chat-initial="member.username.charAt(0).toUpperCase()" />

			<div class="min-w-0 flex-1">
				<p class="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
					{{ member.username }}
				</p>
				<div class="flex items-center gap-2 mt-0.5">
					<div v-if="isOwner" class="role-menu-container relative">
						<button
							v-if="member.role !== 'OWNER'"
							type="button"
							tabindex="0"
							:aria-label="`Change role of ${member.username}`"
							:disabled="isUpdatingRole === String(member.id)"
							:style="{ pointerEvents: 'auto', zIndex: 100 }"
							:class="[
								'px-2 py-0.5 text-xs font-medium rounded border cursor-pointer transition-colors',
								getRoleColor(member.role),
								getRoleColorDark(member.role),
								isUpdatingRole === String(member.id)
									? 'opacity-50 cursor-not-allowed'
									: 'hover:opacity-80'
							]"
							@mousedown.stop="handleToggleRoleMenu"
							@click.stop="handleToggleRoleMenu"
							@keydown.enter.stop="handleToggleRoleMenu"
						>
							{{ getRoleLabel(member.role) }}
						</button>
						<span
							v-else
							:class="[
								'px-2 py-0.5 text-xs font-medium rounded border',
								getRoleColor(member.role),
								getRoleColorDark(member.role)
							]"
						>
							{{ getRoleLabel(member.role) }}
						</span>
						<div
							v-if="isMenuOpen && member.role !== 'OWNER'"
							class="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-32"
						>
							<button
								v-for="role in getAvailableRoles(member.role)"
								:key="role"
								type="button"
								tabindex="0"
								:aria-label="`Set role to ${getRoleLabel(role)}`"
								:disabled="
									isUpdatingRole === String(member.id) || member.role === role
								"
								:class="[
									'w-full text-left px-3 py-2 text-sm transition-colors',
									member.role === role
										? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
										: 'hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100',
									isUpdatingRole === String(member.id)
										? 'opacity-50 cursor-not-allowed'
										: ''
								]"
								@click.stop="handleChangeRole(role)"
								@keydown.enter.stop="handleChangeRole(role)"
							>
								{{ getRoleLabel(role) }}
							</button>
						</div>
					</div>
					<span
						v-else
						:class="[
							'px-2 py-0.5 text-xs font-medium rounded border',
							getRoleColor(member.role),
							getRoleColorDark(member.role)
						]"
					>
						{{ getRoleLabel(member.role) }}
					</span>
					<span
						v-if="member.isOnline"
						class="h-1.5 w-1.5 rounded-full bg-green-500"
						aria-label="Online"
					></span>
				</div>
			</div>
		</div>
		<div v-if="isOwner" class="flex items-center gap-1">
			<button
				v-if="!isCurrentUser"
				type="button"
				tabindex="0"
				:aria-label="`Remove ${member.username} from chat`"
				:disabled="isRemovingUser === String(member.id)"
				class="size-8 flex justify-center items-center p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full transition-colors disabled:opacity-50"
				@click="handleRemoveUser"
				@keydown.enter="handleRemoveUser"
			>
				<Icon name="bin" class="size-4" />
			</button>
		</div>
	</div>
</template>
