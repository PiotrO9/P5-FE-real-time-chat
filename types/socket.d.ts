import type { Socket } from 'socket.io-client';
import type { User } from './Chat';
import type { Invite } from './FriendsApi';

declare module '#app' {
    interface NuxtApp {
        $socket: Socket;
    }
}

declare module 'vue' {
    interface ComponentCustomProperties {
        $socket: Socket;
    }
}

export interface FriendInviteReceivedEvent {
    invite: {
        id: string;
        status: 'PENDING';
        createdAt: Date | string;
        sender: User;
        receiver?: User;
    };
}

export interface FriendInviteAcceptedEvent {
    friendship: {
        requester: User;
        addressee: User;
    };
}

export interface FriendInviteRejectedEvent {
    invite: {
        id: string;
        status: 'REJECTED';
        createdAt: Date | string;
        sender?: User;
        receiver: User;
    };
}

export interface FriendRemovedEvent {
    friendId: string;
    friend: User;
}

export {};
