<template>
    <div class="min-h-screen bg-gray-50 px-4 py-8">
        <div class="mx-auto max-w-6xl">
            <div class="mb-6 rounded-lg bg-white p-6 shadow-lg">
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <h1 class="mb-2 text-3xl font-bold text-gray-900">Users</h1>
                        <p class="text-gray-600">User List</p>
                    </div>
                    <NuxtLink
                        to="/dashboard"
                        class="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700"
                    >
                        Back to Dashboard
                    </NuxtLink>
                </div>
            </div>

            <div class="space-y-4">
                <div class="rounded-lg bg-white p-6 shadow-lg">
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div class="flex items-center gap-4">
                            <div
                                class="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white"
                            >
                                JD
                            </div>

                            <div>
                                <h3 class="text-lg font-bold text-gray-900">Jan Kowalski</h3>
                                <p class="text-gray-600">jan.kowalski@example.com</p>
                                <p class="text-sm text-gray-500">
                                    Last activity: Jan 1, 2024, 10:30
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <span
                                class="rounded-full border border-green-200 bg-green-100 px-3 py-1 text-sm font-medium text-green-800"
                            >
                                <span class="mr-2 inline-block size-2 rounded-full bg-green-500" />
                                Online
                            </span>

                            <NuxtLink
                                to="/users/1"
                                class="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-900 transition-colors hover:bg-gray-200"
                            >
                                View Profile
                            </NuxtLink>
                        </div>
                    </div>
                </div>

                <div class="rounded-lg bg-white p-6 shadow-lg">
                    <div class="flex flex-wrap items-center justify-between gap-4">
                        <div class="flex items-center gap-4">
                            <div
                                class="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold text-white"
                            >
                                AN
                            </div>

                            <div>
                                <h3 class="text-lg font-bold text-gray-900">Anna Nowak</h3>
                                <p class="text-gray-600">anna.nowak@example.com</p>
                                <p class="text-sm text-gray-500">
                                    Last activity: Dec 31, 2023, 15:45
                                </p>
                            </div>
                        </div>

                        <div class="flex items-center gap-3">
                            <span
                                class="rounded-full border border-gray-200 bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800"
                            >
                                <span class="mr-2 inline-block size-2 rounded-full bg-gray-500" />
                                Offline
                            </span>

                            <NuxtLink
                                to="/users/2"
                                class="rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-900 transition-colors hover:bg-gray-200"
                            >
                                View Profile
                            </NuxtLink>
                        </div>
                    </div>
                </div>
            </div>

            <div class="mt-6 rounded-lg bg-white p-6 shadow-lg">
                <div class="flex flex-wrap items-center justify-between gap-4">
                    <div class="text-gray-600">Page 1 of 1</div>

                    <div class="flex gap-3">
                        <button
                            type="button"
                            class="cursor-not-allowed rounded-lg bg-gray-100 px-4 py-2 font-medium text-gray-400"
                        >
                            Previous
                        </button>

                        <button
                            type="button"
                            class="cursor-not-allowed rounded-lg bg-gray-300 px-4 py-2 font-medium text-white"
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
