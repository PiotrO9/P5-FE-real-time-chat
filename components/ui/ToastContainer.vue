<script setup lang="ts">
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next';

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
            return `${baseClasses} bg-primary-50 border-primary-500 text-primary-900`;
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
            return 'text-primary-500';
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
                    <CheckCircle
                        v-if="toast.type === 'success'"
                        class="size-5"
                    />
                    <AlertCircle
                        v-else-if="toast.type === 'error'"
                        class="size-5"
                    />
                    <AlertTriangle
                        v-else-if="toast.type === 'warning'"
                        class="size-5"
                    />
                    <Info v-else class="size-5" />
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
                    <X class="size-4" />
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
