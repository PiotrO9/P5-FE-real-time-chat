import type { Friend, User } from '~/types/Chat';
import type { FriendResponse } from '~/types/FriendsApi';
import type { FriendInviteAcceptedEvent } from '~/types/socket';
import {
    fetchFriends as fetchFriendsFromService,
    sendFriendInvite,
    deleteFriend as deleteFriendFromService,
    searchFriends as searchFriendsFromService,
} from '~/services/friendsService';
import { getErrorMessage } from '~/utils/errorHelpers';
import { findById, compareIds } from '~/utils/idHelpers';
import { useToast } from './useToast';

export function useFriends() {
    const { error: toastError, success: toastSuccess } = useToast();

    const friends = ref<Friend[]>([]);
    const friendsLoading = ref(false);
    const friendsError = ref<string | null>(null);
    const searchQuery = ref('');
    const searchResults = ref<Friend[]>([]);
    const searchLoading = ref(false);
    const searchError = ref<string | null>(null);

    function mapFriendResponse(friend: FriendResponse): Friend {
        return {
            id: friend.id,
            username: friend.username,
            email: friend.email,
            isOnline: friend.isOnline,
            lastSeen: friend.lastSeen,
            friendshipCreatedAt: friend.friendshipCreatedAt,
            createdAt: friend.createdAt,
        };
    }

    async function fetchFriends() {
        try {
            friendsLoading.value = true;
            friendsError.value = null;

            const res = await fetchFriendsFromService();
            const raw = res?.data;
            const friendsList: FriendResponse[] = Array.isArray(raw?.friends)
                ? raw.friends
                : [];

            friends.value = friendsList.map(mapFriendResponse);
        } catch (err: any) {
            friendsError.value = getErrorMessage(
                err,
                'Failed to fetch friends list',
            );

            if (friendsError.value) {
                toastError(friendsError.value);
            }
        } finally {
            friendsLoading.value = false;
        }
    }

    async function addFriend(username: string) {
        if (!username.trim()) {
            toastError('Please provide a username');
            return;
        }

        try {
            await sendFriendInvite(username.trim());
            toastSuccess(`Invitation sent to ${username}`);
        } catch (err: any) {
            const errorMessage = getErrorMessage(
                err,
                'Failed to send invitation',
            );
            toastError(errorMessage);
        }
    }

    async function removeFriend(friendId: string | number) {
        const friend = findById(friends.value, friendId);
        if (!friend) return;

        try {
            await deleteFriendFromService(String(friendId));
            toastSuccess(`${friend.username} has been removed from friends`);
            await fetchFriends();
        } catch (err: any) {
            const errorMessage = getErrorMessage(
                err,
                'Failed to remove friend',
            );
            toastError(errorMessage);
        }
    }

    function updateFriendStatus(
        userId: string | number,
        isOnline: boolean,
        lastSeen?: Date,
    ) {
        const friend = findById(friends.value, userId);
        if (friend) {
            friend.isOnline = isOnline;
            if (lastSeen) {
                friend.lastSeen = lastSeen.toISOString();
            }
        }
    }

    function findFriendById(friendId: string | number): Friend | undefined {
        return findById(friends.value, friendId);
    }

    function mapUserToFriend(
        user: User,
        _isRequester: boolean = false,
    ): Friend {
        return {
            id: user.id,
            username: user.username,
            email: user.email,
            isOnline: false,
            lastSeen: user.lastSeen,
            createdAt: user.createdAt,
            friendshipCreatedAt: new Date().toISOString(),
        };
    }

    function addFriendFromEvent(
        friendship: FriendInviteAcceptedEvent['friendship'],
        currentUserId: string | number,
    ) {
        const isCurrentUserRequester = compareIds(
            friendship.requester.id,
            currentUserId,
        );
        const newFriend = isCurrentUserRequester
            ? mapUserToFriend(friendship.addressee, false)
            : mapUserToFriend(friendship.requester, true);

        const existingFriend = findFriendById(newFriend.id);
        if (!existingFriend) {
            friends.value.push(newFriend);
        }
    }

    function removeFriendFromList(friendId: string | number) {
        const index = friends.value.findIndex((friend) =>
            compareIds(friend.id, friendId),
        );
        if (index !== -1) {
            friends.value.splice(index, 1);
        }
    }

    async function searchFriends(query: string) {
        if (!query.trim()) {
            searchResults.value = [];
            searchError.value = null;
            searchQuery.value = '';
            return;
        }

        try {
            searchLoading.value = true;
            searchError.value = null;

            const res = await searchFriendsFromService(query.trim());
            const raw = res?.data;
            const friendsList: FriendResponse[] = Array.isArray(raw?.friends)
                ? raw.friends
                : [];

            searchResults.value = friendsList.map(mapFriendResponse);
        } catch (err: any) {
            searchError.value = getErrorMessage(
                err,
                'Failed to search friends',
            );
            toastError(searchError.value || 'Error');
        } finally {
            searchLoading.value = false;
        }
    }

    function clearSearch() {
        searchQuery.value = '';
        searchResults.value = [];
        searchError.value = null;
    }

    const displayedFriends = computed(() => {
        if (searchQuery.value.trim() && searchResults.value.length > 0) {
            return searchResults.value;
        }
        if (searchQuery.value.trim() && !searchLoading.value) {
            return [];
        }
        return friends.value;
    });

    watch(searchQuery, (query: string) => {
        if (query.trim()) {
            setTimeout(() => {
                if (searchQuery.value === query) {
                    searchFriends(query);
                }
            }, 300);
        } else {
            clearSearch();
        }
    });

    return {
        friends,
        friendsLoading,
        friendsError,
        searchQuery,
        searchResults,
        searchLoading,
        searchError,
        displayedFriends,
        fetchFriends,
        addFriend,
        removeFriend,
        updateFriendStatus,
        findFriendById,
        addFriendFromEvent,
        removeFriendFromList,
        searchFriends,
        clearSearch,
    };
}
