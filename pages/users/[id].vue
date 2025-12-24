<template>
    <div class="min-h-screen bg-gray-50 px-4 py-8">
        <div class="mx-auto max-w-4xl">
            <div class="mb-6">
                <NuxtLink
                    to="/users"
                    class="mb-4 flex items-center gap-2 font-medium text-blue-600 hover:text-blue-700"
                >
                    <svg class="size-5" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fill-rule="evenodd"
                            d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                            clip-rule="evenodd"
                        />
                    </svg>
                    Back to user list
                </NuxtLink>
            </div>

            <div class="space-y-6">
                <div class="rounded-lg bg-white p-8 shadow-lg">
                    <div class="flex flex-col items-center text-center">
                        <div
                            class="mb-4 flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-3xl font-bold text-white"
                        >
                            JK
                        </div>

                        <div class="mb-2">
                            <h1 class="mb-2 text-3xl font-bold text-gray-900">
                                Jan Kowalski
                            </h1>
                            <span
                                class="inline-flex items-center rounded-full border border-green-200 bg-green-100 px-4 py-2 text-sm font-medium text-green-800"
                            >
                                <span
                                    class="mr-2 inline-block size-2 rounded-full bg-green-500"
                                />
                                Online
                            </span>
                        </div>

                        <p class="mt-4 text-lg text-gray-600">
                            jan.kowalski@example.com
                        </p>

                        <NuxtLink
                            to="/dashboard"
                            class="mt-6 rounded-lg bg-blue-600 px-6 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                        >
                            Edit Profile
                        </NuxtLink>
                    </div>
                </div>

                <div class="rounded-lg bg-white p-6 shadow-lg">
                    <h2 class="mb-4 text-xl font-bold text-gray-900">
                        Profile Details
                    </h2>
                    <div class="space-y-4">
                        <div
                            class="flex items-center justify-between border-b border-gray-200 py-3"
                        >
                            <span class="font-medium text-gray-600"
                                >User ID</span
                            >
                            <span class="font-mono text-sm text-gray-900"
                                >123456</span
                            >
                        </div>

                        <div
                            class="flex items-center justify-between border-b border-gray-200 py-3"
                        >
                            <span class="font-medium text-gray-600">Email</span>
                            <span class="text-gray-900"
                                >jan.kowalski@example.com</span
                            >
                        </div>

                        <div
                            class="flex items-center justify-between border-b border-gray-200 py-3"
                        >
                            <span class="font-medium text-gray-600"
                                >Username</span
                            >
                            <span class="text-gray-900">Jan Kowalski</span>
                        </div>

                        <div
                            class="flex items-center justify-between border-b border-gray-200 py-3"
                        >
                            <span class="font-medium text-gray-600"
                                >Status</span
                            >
                            <span class="font-medium text-green-600"
                                >Online</span
                            >
                        </div>

                        <div
                            class="flex items-center justify-between border-b border-gray-200 py-3"
                        >
                            <span class="font-medium text-gray-600"
                                >Created Date</span
                            >
                            <span class="text-gray-900"
                                >January 1, 2024, 10:00</span
                            >
                        </div>

                        <div class="flex items-center justify-between py-3">
                            <span class="font-medium text-gray-600"
                                >Last Activity</span
                            >
                            <span class="text-gray-900"
                                >January 5, 2024, 15:30</span
                            >
                        </div>
                    </div>
                </div>

                <div
                    class="rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 p-6 shadow-lg"
                >
                    <div class="flex items-start gap-4">
                        <div class="flex-shrink-0">
                            <svg
                                class="size-8 text-blue-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    fill-rule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clip-rule="evenodd"
                                />
                            </svg>
                        </div>
                        <div>
                            <h3 class="mb-1 font-bold text-gray-900">
                                Activity Information
                            </h3>
                            <p class="text-gray-700">
                                User Jan Kowalski is currently online. Last
                                activity: January 5, 2024, 15:30.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
