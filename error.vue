<script setup lang="ts">
interface ErrorProps {
    error: {
        statusCode: number;
        statusMessage?: string;
        message?: string;
        stack?: string;
    };
}

const props = defineProps<ErrorProps>();

const errorTitle = computed(() => {
    if (props.error.statusCode === 404) {
        return 'Page Not Found';
    }

    if (props.error.statusCode === 500) {
        return 'Server Error';
    }

    return 'An Error Occurred';
});

const errorDescription = computed(() => {
    if (props.error.statusCode === 404) {
        return 'Sorry, but the page you are looking for does not exist or has been moved.';
    }

    if (props.error.statusCode === 500) {
        return 'An unexpected server error occurred. Our team has been notified and is working on resolving the issue.';
    }

    return props.error.message || 'An unexpected error occurred.';
});

function handleGoHome() {
    navigateTo('/');
}

function handleGoBack() {
    if (typeof window !== 'undefined' && window.history.length > 1) {
        window.history.back();
    } else {
        navigateTo('/');
    }
}

function handleKeyDown(event: KeyboardEvent, action: () => void) {
    if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        action();
    }
}
</script>

<template>
    <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
        <div class="w-full max-w-lg text-center">
            <div class="rounded-lg bg-white p-8 shadow-lg md:p-12">
                <div class="mb-8">
                    <div
                        class="mx-auto mb-6 flex size-24 items-center justify-center rounded-full"
                        :class="
                            error.statusCode === 404
                                ? 'bg-primary-100 text-primary-600'
                                : 'bg-red-100 text-red-600'
                        "
                    >
                        <Icon
                            :name="error.statusCode === 404 ? 'status-info' : 'status-error'"
                            class="size-12"
                            aria-hidden="true"
                        />
                    </div>

                    <h1
                        class="mb-4 text-6xl font-bold"
                        :class="error.statusCode === 404 ? 'text-primary-600' : 'text-red-600'"
                    >
                        {{ error.statusCode }}
                    </h1>

                    <h2 class="mb-4 text-2xl font-semibold text-gray-900">
                        {{ errorTitle }}
                    </h2>

                    <p class="mb-8 text-lg text-gray-600">
                        {{ errorDescription }}
                    </p>
                </div>

                <div class="flex flex-col justify-center gap-4 sm:flex-row">
                    <button
                        type="button"
                        tabindex="0"
                        aria-label="Go back to previous page"
                        class="rounded-lg bg-gray-200 px-6 py-3 font-medium text-gray-800 transition-colors hover:bg-gray-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
                        @click="handleGoBack"
                        @keydown="(e) => handleKeyDown(e, handleGoBack)"
                    >
                        Go Back
                    </button>

                    <button
                        type="button"
                        tabindex="0"
                        aria-label="Go to home page"
                        class="rounded-lg bg-primary-600 px-6 py-3 font-medium text-white transition-colors hover:bg-primary-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                        @click="handleGoHome"
                        @keydown="(e) => handleKeyDown(e, handleGoHome)"
                    >
                        Home
                    </button>
                </div>

                <div
                    v-if="error.statusCode === 500 && error.stack"
                    class="mt-8 border-t border-gray-200 pt-8"
                >
                    <details class="text-left">
                        <summary
                            class="mb-2 cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900"
                            tabindex="0"
                            @keydown="
                                (e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        const target = e.currentTarget as HTMLElement;
                                        if (target?.parentElement) {
                                            const details =
                                                target.parentElement as HTMLDetailsElement;
                                            details.open = !details.open;
                                        }
                                    }
                                }
                            "
                        >
                            Error Details (Development Mode)
                        </summary>
                        <pre
                            class="mt-4 max-h-64 overflow-auto rounded-lg bg-gray-100 p-4 text-xs text-gray-800"
                            >{{ error.stack }}</pre
                        >
                    </details>
                </div>
            </div>
        </div>
    </div>
</template>
