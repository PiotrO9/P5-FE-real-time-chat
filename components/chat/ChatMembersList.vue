<script setup lang="ts">
import type { ChatMember, Role } from '~/types/ChatsApi';
import ChatMemberItem from './ChatMemberItem.vue';

interface Props {
    members: ChatMember[];
    currentUserId: number | string;
    isOwner: boolean;
    isLoading: boolean;
    openRoleMenuId: string | null;
    isUpdatingRole: string | null;
    isRemovingUser: string | null;
}

interface Emits {
    (e: 'toggle-role-menu', memberId: string, event?: Event): void;
    (e: 'change-role', memberId: string, newRole: Role): void;
    (e: 'remove-user', userId: string): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

function handleToggleRoleMenu(memberId: string, event?: Event) {
    emit('toggle-role-menu', memberId, event);
}

function handleChangeRole(memberId: string, newRole: Role) {
    emit('change-role', memberId, newRole);
}

function handleRemoveUser(userId: string) {
    emit('remove-user', userId);
}
</script>

<template>
    <div class="p-4">
        <h3 class="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
            Members ({{ members.length }})
        </h3>
        <div v-if="isLoading" class="text-sm text-gray-600 dark:text-gray-400">Loading...</div>
        <div v-else class="space-y-2">
            <ChatMemberItem
                v-for="member in members"
                :key="member.id"
                :member="member"
                :current-user-id="currentUserId"
                :is-owner="isOwner"
                :open-role-menu-id="openRoleMenuId"
                :is-updating-role="isUpdatingRole"
                :is-removing-user="isRemovingUser"
                @toggle-role-menu="handleToggleRoleMenu"
                @change-role="handleChangeRole"
                @remove-user="handleRemoveUser"
            />
        </div>
    </div>
</template>
