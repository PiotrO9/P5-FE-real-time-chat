<script setup lang="ts">
const { login, loading, error } = useAuth();

const title = ref('Login');
const email = ref('');
const password = ref('');

async function handleSubmit(event: Event) {
    event.preventDefault();

    if (!email.value || !password.value) {
        return;
    }

    try {
        await login(email.value, password.value);
        await navigateTo('/dashboard');
    } catch (err: any) {
        console.error('Login failed:', err);
    }
}
</script>

<template>
    <div
        class="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900"
    >
        <div class="w-full max-w-md">
            <div class="rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
                <div class="mb-8 text-center">
                    <h1
                        class="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100"
                    >
                        {{ title }}
                    </h1>
                    <p class="text-gray-600 dark:text-gray-400">
                        Welcome back!
                    </p>
                </div>

                <form class="space-y-6" @submit="handleSubmit">
                    <div
                        v-if="error"
                        class="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400"
                    >
                        {{ error }}
                    </div>

                    <div>
                        <label
                            for="email"
                            class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            v-model="email"
                            type="email"
                            autocomplete="email"
                            required
                            placeholder="your@email.com"
                            class="w-full rounded-full border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                        />
                    </div>

                    <div>
                        <label
                            for="password"
                            class="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                        >
                            Password
                        </label>
                        <input
                            id="password"
                            v-model="password"
                            type="password"
                            autocomplete="current-password"
                            required
                            placeholder="Enter your password"
                            class="w-full rounded-full border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder-gray-400 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-500"
                        />
                    </div>

                    <button
                        type="submit"
                        :disabled="loading"
                        class="w-full rounded-lg bg-primary-600 px-4 py-3 font-medium text-white transition-colors hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-primary-700 dark:hover:bg-primary-800"
                    >
                        {{ loading ? 'Logging in...' : 'Login' }}
                    </button>
                </form>

                <div class="mt-6 text-center">
                    <p class="text-gray-600 dark:text-gray-400">
                        Don't have an account?
                        <NuxtLink
                            to="/register"
                            class="font-medium text-primary-600 hover:text-primary-700 hover:underline dark:text-primary-400 dark:hover:text-primary-500"
                        >
                            Register
                        </NuxtLink>
                    </p>
                </div>
            </div>
        </div>
    </div>
</template>
