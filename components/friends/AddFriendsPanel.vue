<script setup lang="ts">
import type { Invite } from '~/types/FriendsApi';
import ChatInitial from '../chat/ChatInitial.vue';

interface Props {
    sentInvites?: Invite[];
    receivedInvites?: Invite[];
}

interface Emits {
    (e: 'add-friend' | 'accept-invite' | 'reject-invite', value: string): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const username = ref('');
const isSubmitting = ref(false);
const isReceivedPastExpanded = ref(false);
const isSentPastExpanded = ref(false);

const sentInvites = computed(() => props.sentInvites ?? []);
const receivedInvites = computed(() => props.receivedInvites ?? []);

const receivedActiveInvites = computed(() =>
    receivedInvites.value.filter((invite) => invite.status === 'PENDING'),
);
const receivedPastInvites = computed(() =>
    receivedInvites.value.filter(
        (invite) =>
            invite.status === 'ACCEPTED' || invite.status === 'REJECTED',
    ),
);

const sentActiveInvites = computed(() =>
    sentInvites.value.filter((invite) => invite.status === 'PENDING'),
);
const sentPastInvites = computed(() =>
    sentInvites.value.filter(
        (invite) =>
            invite.status === 'ACCEPTED' || invite.status === 'REJECTED',
    ),
);

function handleSubmit() {
    const trimmedUsername = username.value.trim();

    if (!trimmedUsername) {
        return;
    }

    isSubmitting.value = true;
    emit('add-friend', trimmedUsername);
    username.value = '';

    setTimeout(() => {
        isSubmitting.value = false;
    }, 500);
}

function handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
        event.preventDefault();
        handleSubmit();
    }
}

function handleAccept(inviteId: string) {
    emit('accept-invite', inviteId);
}

function handleReject(inviteId: string) {
    emit('reject-invite', inviteId);
}

function handleInviteKeyDown(
    event: KeyboardEvent,
    action: 'accept' | 'reject',
    inviteId: string,
) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();

        if (action === 'accept') {
            handleAccept(inviteId);
        } else {
            handleReject(inviteId);
        }
    }
}

function getInitials(username: string): string {
    return username
        .split(' ')
        .map((name) => name[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);

    return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getStatusBadgeClass(status: string): string {
    switch (status) {
        case 'PENDING':
            return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700';
        case 'ACCEPTED':
            return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-700';
        case 'REJECTED':
            return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-700';
        default:
            return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
}

function getStatusText(status: string): string {
    switch (status) {
        case 'PENDING':
            return 'Pending';
        case 'ACCEPTED':
            return 'Accepted';
        case 'REJECTED':
            return 'Rejected';
        default:
            return status;
    }
}

function handleToggleReceivedPast() {
    isReceivedPastExpanded.value = !isReceivedPastExpanded.value;
}

function handleToggleSentPast() {
    isSentPastExpanded.value = !isSentPastExpanded.value;
}

function handleToggleKeyDown(event: KeyboardEvent, toggleFn: () => void) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        toggleFn();
    }
}
</script>

<template>
    <div
        class="flex h-full flex-col rounded-b-[1.125rem] bg-white dark:bg-gray-900"
    >
        <div class="border-b border-gray-200 px-4 py-3 dark:border-gray-700">
            <label
                for="username-input"
                class="mb-2 block text-sm font-medium text-gray-900 dark:text-gray-100"
            >
                Add friend
            </label>
            <div class="flex gap-2">
                <input
                    id="username-input"
                    v-model="username"
                    type="text"
                    placeholder="Enter username..."
                    class="min-w-0 flex-1 rounded-full border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                    :disabled="isSubmitting"
                    @keydown="handleKeyDown"
                />
                <button
                    type="button"
                    class="flex-shrink-0 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-600 dark:hover:bg-primary-700 md:px-4"
                    tabindex="0"
                    aria-label="Send invitation"
                    :disabled="!username.trim() || isSubmitting"
                    @click="handleSubmit"
                >
                    <span class="hidden sm:inline">Send</span>
                    <span class="sm:hidden">+</span>
                </button>
            </div>
            <p class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                Enter the username of the person you want to send a friend
                invitation to.
            </p>
        </div>

        <div class="flex-1 overflow-y-auto">
            <div
                v-if="receivedInvites.length === 0 && sentInvites.length === 0"
                class="px-4 py-4"
            >
                <div
                    class="rounded-lg border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20"
                >
                    <h4
                        class="mb-2 text-sm font-semibold text-primary-900 dark:text-primary-300"
                    >
                        How it works?
                    </h4>
                    <ul
                        class="list-inside list-disc space-y-1 text-xs text-primary-800 dark:text-primary-300"
                    >
                        <li>
                            Enter the username of the person you want to add
                        </li>
                        <li>A friend invitation will be sent</li>
                        <li>
                            The person will receive the invitation and can
                            accept or reject it
                        </li>
                        <li>
                            After acceptance, you'll find them in your friends
                            list
                        </li>
                    </ul>
                </div>
            </div>

            <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
                <div
                    v-if="
                        receivedActiveInvites.length > 0 ||
                        receivedPastInvites.length > 0
                    "
                    class="pb-4"
                >
                    <h3
                        class="bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                        Received invitations
                        {{
                            receivedActiveInvites.length > 0
                                ? `(${receivedActiveInvites.length} active)`
                                : ''
                        }}
                    </h3>

                    <!-- Active received invites -->
                    <ul
                        v-if="receivedActiveInvites.length > 0"
                        class="divide-y divide-gray-100 dark:divide-gray-800"
                        role="listbox"
                        aria-label="Active received invitations list"
                    >
                        <li
                            v-for="invite in receivedActiveInvites"
                            :key="invite.id"
                            class="px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                            role="option"
                            :aria-label="`Pending invitation from ${invite.sender?.username}`"
                        >
                            <div
                                class="flex items-center justify-between gap-3"
                            >
                                <div
                                    class="flex min-w-0 flex-1 items-center gap-3"
                                >
                                    <ChatInitial
                                        :chat-initial="
                                            getInitials(
                                                invite.sender?.username || '',
                                            )
                                        "
                                    />
                                    <div class="min-w-0 flex-1">
                                        <p
                                            class="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
                                        >
                                            {{ invite.sender?.username }}
                                        </p>
                                        <p
                                            class="truncate text-xs text-gray-500 dark:text-gray-400"
                                        >
                                            {{ invite.sender?.email }}
                                        </p>
                                        <p
                                            class="mt-1 text-xs text-gray-400 dark:text-gray-500"
                                        >
                                            {{ formatDate(invite.createdAt) }}
                                        </p>
                                    </div>
                                </div>
                                <div
                                    class="flex flex-shrink-0 items-center gap-1 md:gap-2"
                                >
                                    <span
                                        :class="[
                                            'hidden rounded-full border px-2 py-1 text-xs font-medium sm:inline-block',
                                            getStatusBadgeClass(invite.status),
                                        ]"
                                    >
                                        {{ getStatusText(invite.status) }}
                                    </span>
                                    <button
                                        type="button"
                                        class="rounded-lg bg-green-500 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 md:px-3"
                                        tabindex="0"
                                        aria-label="Accept invitation"
                                        @click="handleAccept(invite.id)"
                                        @keydown="
                                            handleInviteKeyDown(
                                                $event,
                                                'accept',
                                                invite.id,
                                            )
                                        "
                                    >
                                        <span class="hidden sm:inline"
                                            >Accept</span
                                        >
                                        <span class="sm:hidden">✓</span>
                                    </button>
                                    <button
                                        type="button"
                                        class="rounded-lg bg-red-500 px-2 py-1.5 text-xs font-medium text-white transition-colors hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 md:px-3"
                                        tabindex="0"
                                        aria-label="Reject invitation"
                                        @click="handleReject(invite.id)"
                                        @keydown="
                                            handleInviteKeyDown(
                                                $event,
                                                'reject',
                                                invite.id,
                                            )
                                        "
                                    >
                                        <span class="hidden sm:inline"
                                            >Reject</span
                                        >
                                        <span class="sm:hidden">×</span>
                                    </button>
                                </div>
                            </div>
                        </li>
                    </ul>

                    <!-- Past received invites (collapsible) -->
                    <div v-if="receivedPastInvites.length > 0">
                        <button
                            type="button"
                            class="flex w-full items-center justify-between bg-gray-50 px-4 py-2 text-left text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                            tabindex="0"
                            :aria-label="
                                isReceivedPastExpanded
                                    ? 'Collapse past received invitations'
                                    : 'Expand past received invitations'
                            "
                            :aria-expanded="isReceivedPastExpanded"
                            @click="handleToggleReceivedPast"
                            @keydown="
                                handleToggleKeyDown(
                                    $event,
                                    handleToggleReceivedPast,
                                )
                            "
                        >
                            <span>
                                Past invitations ({{
                                    receivedPastInvites.length
                                }})
                            </span>
                            <svg
                                :class="[
                                    'size-4 transition-transform',
                                    isReceivedPastExpanded ? 'rotate-180' : '',
                                ]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>
                        <div
                            v-show="isReceivedPastExpanded"
                            class="divide-y divide-gray-100 dark:divide-gray-800"
                        >
                            <ul
                                role="listbox"
                                aria-label="Past received invitations list"
                            >
                                <li
                                    v-for="invite in receivedPastInvites"
                                    :key="invite.id"
                                    class="px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                    role="option"
                                    :aria-label="`${invite.status} invitation from ${invite.sender?.username}`"
                                >
                                    <div
                                        class="flex items-center justify-between gap-3"
                                    >
                                        <div
                                            class="flex min-w-0 flex-1 items-center gap-3"
                                        >
                                            <ChatInitial
                                                :chat-initial="
                                                    getInitials(
                                                        invite.sender
                                                            ?.username || '',
                                                    )
                                                "
                                            />
                                            <div class="min-w-0 flex-1">
                                                <p
                                                    class="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
                                                >
                                                    {{
                                                        invite.sender?.username
                                                    }}
                                                </p>
                                                <p
                                                    class="truncate text-xs text-gray-500 dark:text-gray-400"
                                                >
                                                    {{ invite.sender?.email }}
                                                </p>
                                                <p
                                                    class="mt-1 text-xs text-gray-400 dark:text-gray-500"
                                                >
                                                    {{
                                                        formatDate(
                                                            invite.createdAt,
                                                        )
                                                    }}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            :class="[
                                                'rounded-full border px-2 py-1 text-xs font-medium',
                                                getStatusBadgeClass(
                                                    invite.status,
                                                ),
                                            ]"
                                        >
                                            {{ getStatusText(invite.status) }}
                                        </span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div
                    v-if="
                        sentActiveInvites.length > 0 ||
                        sentPastInvites.length > 0
                    "
                >
                    <h3
                        class="bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    >
                        Sent invitations
                        {{
                            sentActiveInvites.length > 0
                                ? `(${sentActiveInvites.length} active)`
                                : ''
                        }}
                    </h3>

                    <!-- Active sent invites -->
                    <ul
                        v-if="sentActiveInvites.length > 0"
                        class="divide-y divide-gray-100 dark:divide-gray-800"
                        role="listbox"
                        aria-label="Active sent invitations list"
                    >
                        <li
                            v-for="invite in sentActiveInvites"
                            :key="invite.id"
                            class="px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                            role="option"
                            :aria-label="`Pending invitation to ${invite.receiver?.username}`"
                        >
                            <div
                                class="flex items-center justify-between gap-3"
                            >
                                <div
                                    class="flex min-w-0 flex-1 items-center gap-3"
                                >
                                    <ChatInitial
                                        :chat-initial="
                                            getInitials(
                                                invite.receiver?.username || '',
                                            )
                                        "
                                    />
                                    <div class="min-w-0 flex-1">
                                        <p
                                            class="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
                                        >
                                            {{ invite.receiver?.username }}
                                        </p>
                                        <p
                                            class="truncate text-xs text-gray-500 dark:text-gray-400"
                                        >
                                            {{ invite.receiver?.email }}
                                        </p>
                                        <p
                                            class="mt-1 text-xs text-gray-400 dark:text-gray-500"
                                        >
                                            {{ formatDate(invite.createdAt) }}
                                        </p>
                                    </div>
                                </div>
                                <span
                                    :class="[
                                        'rounded-full border px-2 py-1 text-xs font-medium',
                                        getStatusBadgeClass(invite.status),
                                    ]"
                                >
                                    {{ getStatusText(invite.status) }}
                                </span>
                            </div>
                        </li>
                    </ul>

                    <!-- Past sent invites (collapsible) -->
                    <div v-if="sentPastInvites.length > 0">
                        <button
                            type="button"
                            class="flex w-full items-center justify-between bg-gray-50 px-4 py-2 text-left text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                            tabindex="0"
                            :aria-label="
                                isSentPastExpanded
                                    ? 'Collapse past sent invitations'
                                    : 'Expand past sent invitations'
                            "
                            :aria-expanded="isSentPastExpanded"
                            @click="handleToggleSentPast"
                            @keydown="
                                handleToggleKeyDown(
                                    $event,
                                    handleToggleSentPast,
                                )
                            "
                        >
                            <span>
                                Past invitations ({{ sentPastInvites.length }})
                            </span>
                            <svg
                                :class="[
                                    'size-4 transition-transform',
                                    isSentPastExpanded ? 'rotate-180' : '',
                                ]"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    stroke-linecap="round"
                                    stroke-linejoin="round"
                                    stroke-width="2"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>
                        <div
                            v-show="isSentPastExpanded"
                            class="divide-y divide-gray-100 dark:divide-gray-800"
                        >
                            <ul
                                role="listbox"
                                aria-label="Past sent invitations list"
                            >
                                <li
                                    v-for="invite in sentPastInvites"
                                    :key="invite.id"
                                    class="px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                                    role="option"
                                    :aria-label="`${invite.status} invitation to ${invite.receiver?.username}`"
                                >
                                    <div
                                        class="flex items-center justify-between gap-3"
                                    >
                                        <div
                                            class="flex min-w-0 flex-1 items-center gap-3"
                                        >
                                            <ChatInitial
                                                :chat-initial="
                                                    getInitials(
                                                        invite.receiver
                                                            ?.username || '',
                                                    )
                                                "
                                            />
                                            <div class="min-w-0 flex-1">
                                                <p
                                                    class="truncate text-sm font-medium text-gray-900 dark:text-gray-100"
                                                >
                                                    {{
                                                        invite.receiver
                                                            ?.username
                                                    }}
                                                </p>
                                                <p
                                                    class="truncate text-xs text-gray-500 dark:text-gray-400"
                                                >
                                                    {{ invite.receiver?.email }}
                                                </p>
                                                <p
                                                    class="mt-1 text-xs text-gray-400 dark:text-gray-500"
                                                >
                                                    {{
                                                        formatDate(
                                                            invite.createdAt,
                                                        )
                                                    }}
                                                </p>
                                            </div>
                                        </div>
                                        <span
                                            :class="[
                                                'rounded-full border px-2 py-1 text-xs font-medium',
                                                getStatusBadgeClass(
                                                    invite.status,
                                                ),
                                            ]"
                                        >
                                            {{ getStatusText(invite.status) }}
                                        </span>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
