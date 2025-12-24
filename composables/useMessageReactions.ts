import type { Message, Reaction } from '~/types/Chat';
import { addReaction, removeReaction } from '~/services/chatService';

interface GroupedReaction {
    userIds: (string | number)[];
    reactions: Reaction[];
}

export function useMessageReactions(
    message: Ref<Message>,
    currentUserId: Ref<string | number>,
) {
    const reactions = computed(() => message.value.reactions || []);

    const groupedReactions = computed<Record<string, GroupedReaction>>(() => {
        const groups: Record<string, GroupedReaction> = {};

        reactions.value.forEach((reaction) => {
            if (!groups[reaction.emoji]) {
                groups[reaction.emoji] = {
                    userIds: [...reaction.userIds],
                    reactions: [reaction],
                };
            } else {
                const group = groups[reaction.emoji];
                if (group) {
                    reaction.userIds.forEach((userId) => {
                        if (!group.userIds.includes(userId)) {
                            group.userIds.push(userId);
                        }
                    });
                    group.reactions.push(reaction);
                }
            }
        });

        return groups;
    });

    const hasReactions = computed(() => reactions.value.length > 0);

    const userReactions = computed(() => {
        return reactions.value.filter((reaction) =>
            reaction.userIds.some(
                (userId) => String(userId) === String(currentUserId.value),
            ),
        );
    });

    function hasUserReaction(emoji: string): boolean {
        const reactionGroup = groupedReactions.value[emoji];
        if (!reactionGroup) return false;

        const foundReaction = reactionGroup.reactions.find(
            (reaction) => reaction.emoji === emoji,
        );
        if (!foundReaction) return false;

        return foundReaction.userIds.some(
            (userId) => String(userId) === String(currentUserId.value),
        );
    }

    function getReactionCount(emoji: string): number {
        return groupedReactions.value[emoji]?.userIds.length || 0;
    }

    const isReacting = ref(false);

    async function toggleReaction(emoji: string) {
        if (isReacting.value) return null;

        const hasThisReaction = hasUserReaction(emoji);
        const currentUserReaction = userReactions.value.find(
            (reaction) => reaction.emoji === emoji,
        );

        try {
            isReacting.value = true;

            if (hasThisReaction || currentUserReaction) {
                await removeReaction(message.value.id, emoji);
                return { action: 'remove' as const, emoji };
            } else {
                const otherUserReaction = userReactions.value[0];

                if (otherUserReaction) {
                    await removeReaction(
                        message.value.id,
                        otherUserReaction.emoji,
                    );
                }

                await addReaction(message.value.id, emoji);
                return { action: 'add' as const, emoji };
            }
        } catch {
            return null;
        } finally {
            isReacting.value = false;
        }
    }

    return {
        reactions,
        groupedReactions,
        hasReactions,
        userReactions,
        hasUserReaction,
        getReactionCount,
        toggleReaction,
        isReacting,
    };
}
