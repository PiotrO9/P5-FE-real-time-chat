<script setup lang="ts">
const { toasts, removeToast } = useToast();

function handleRemoveToast(id: string) {
    removeToast(id);
}

function handleKeyDown(event: KeyboardEvent, id: string) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleRemoveToast(id);
    }
}

function getToastClasses(type: string) {
    const baseClasses =
        'px-6 py-4 rounded-lg shadow-lg border-l-4 flex items-start gap-3 min-w-[300px] max-w-[500px]';

    switch (type) {
        case 'success':
            return `${baseClasses} bg-green-50 border-green-500 text-green-900`;
        case 'error':
            return `${baseClasses} bg-red-50 border-red-500 text-red-900`;
        case 'warning':
            return `${baseClasses} bg-yellow-50 border-yellow-500 text-yellow-900`;
        case 'info':
        default:
            return `${baseClasses} bg-blue-50 border-blue-500 text-blue-900`;
    }
}

function getIconClasses(type: string) {
    switch (type) {
        case 'success':
            return 'text-green-500';
        case 'error':
            return 'text-red-500';
        case 'warning':
            return 'text-yellow-500';
        case 'info':
        default:
            return 'text-blue-500';
    }
}
</script>

<template>
    <div class="fixed right-4 top-4 z-50 flex flex-col gap-3" aria-live="polite" aria-atomic="true">
        <TransitionGroup name="toast">
            <div
                v-for="toast in toasts"
                :key="toast.id"
                :class="getToastClasses(toast.type)"
                role="alert"
            >
                <div :class="getIconClasses(toast.type)" class="mt-0.5 flex-shrink-0">
                    <Icon
                        v-if="toast.type === 'success'"
                        name="status-success"
                        class="size-5"
                    /><Icon v-else-if="toast.type === 'error'" name="status-error" class="size-5" />
                    <Icon
                        v-else-if="toast.type === 'warning'"
                        name="status-warning"
                        class="size-5"
                    />
                    <Icon v-else name="status-info" class="size-5" />
                </div>

                <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>

                <button
                    type="button"
                    class="flex-shrink-0 rounded p-1 transition-colors hover:bg-black hover:bg-opacity-10"
                    :aria-label="`Zamknij powiadomienie: ${toast.message}`"
                    tabindex="0"
                    @click="handleRemoveToast(toast.id)"
                    @keydown="handleKeyDown($event, toast.id)"
                >
                    <Icon class="size-4" name="remove" />
                </button>
            </div>
        </TransitionGroup>
    </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
    transition: all 0.3s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.toast-leave-to {
    opacity: 0;
    transform: translateX(100%);
}
</style>
