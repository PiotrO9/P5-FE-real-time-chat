import type { ComputedRef, Ref } from 'vue';
import { useHead } from '#imports';
import type { Chat } from '~/types/Chat';

type FriendsViewMode = 'list' | 'add' | 'invites';
type MainViewMode = 'chats' | 'friends';

interface DynamicTitleSources {
    selectedChat: Ref<Chat | null>;
    viewMode: Ref<MainViewMode>;
    friendsSubView: Ref<FriendsViewMode>;
    invitesTotal: ComputedRef<number>;
}

export function useDynamicTitle(sources: DynamicTitleSources) {
    const baseTitle = 'Realtime Chat';

    function buildChatTitle(chat: Chat) {
        const unreadSuffix =
            chat.unreadCount > 0 ? ` (✉ ${chat.unreadCount})` : '';
        if (chat.isGroup) {
            return `Open group chat: ${chat.name}${unreadSuffix}`;
        }
        return `Open chat with ${chat.otherUser.username}${unreadSuffix}`;
    }

    function buildFriendsTitle() {
        if (sources.friendsSubView.value === 'invites') {
            return `Invitations (${sources.invitesTotal.value}) | ${baseTitle}`;
        }
        if (sources.friendsSubView.value === 'add') {
            return `Add friends | ${baseTitle}`;
        }
        if (sources.friendsSubView.value === 'list') {
            return `Friends list | ${baseTitle}`;
        }
        return baseTitle;
    }

    function buildTitle() {
        const chat = sources.selectedChat.value;
        if (chat) {
            return buildChatTitle(chat);
        }

        if (sources.viewMode.value === 'friends') {
            return buildFriendsTitle();
        }

        if (sources.viewMode.value === 'chats') {
            return `Choose a chat | ${baseTitle}`;
        }

        return baseTitle;
    }

    useHead(() => ({
        title: buildTitle(),
    }));

    return {
        buildTitle,
    };
}
