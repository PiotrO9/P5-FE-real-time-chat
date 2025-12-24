export function useTypingText(typingUsers: Ref<string[]>) {
    const typingText = computed(() => {
        if (!typingUsers.value || typingUsers.value.length === 0) return null;

        if (typingUsers.value.length === 1) {
            return `${typingUsers.value[0]} is typing...`;
        }
        if (typingUsers.value.length === 2) {
            return `${typingUsers.value[0]} and ${typingUsers.value[1]} are typing...`;
        }
        return `${typingUsers.value[0]} and ${typingUsers.value.length - 1} others are typing...`;
    });

    const hasTypingUsers = computed(() => (typingUsers.value?.length ?? 0) > 0);

    return {
        typingText,
        hasTypingUsers,
    };
}
