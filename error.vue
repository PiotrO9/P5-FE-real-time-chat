<script setup lang="ts">
interface ErrorProps {
	error: {
		statusCode: number
		statusMessage?: string
		message?: string
		stack?: string
	}
}

const props = defineProps<ErrorProps>()

const errorTitle = computed(() => {
	if (props.error.statusCode === 404) {
		return 'Page Not Found'
	}
	if (props.error.statusCode === 500) {
		return 'Server Error'
	}
	return 'An Error Occurred'
})

const errorDescription = computed(() => {
	if (props.error.statusCode === 404) {
		return 'Sorry, but the page you are looking for does not exist or has been moved.'
	}
	if (props.error.statusCode === 500) {
		return 'An unexpected server error occurred. Our team has been notified and is working on resolving the issue.'
	}
	return props.error.message || 'An unexpected error occurred.'
})

function handleGoHome() {
	navigateTo('/')
}

function handleGoBack() {
	if (typeof window !== 'undefined' && window.history.length > 1) {
		window.history.back()
	} else {
		navigateTo('/')
	}
}

function handleKeyDown(event: KeyboardEvent, action: () => void) {
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault()
		action()
	}
}
</script>

<template>
	<div class="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
		<div class="max-w-lg w-full text-center">
			<div class="bg-white rounded-lg shadow-lg p-8 md:p-12">
				<div class="mb-8">
					<div
						class="mx-auto size-24 mb-6 rounded-full flex items-center justify-center"
						:class="
							error.statusCode === 404
								? 'bg-blue-100 text-blue-600'
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
						class="text-6xl font-bold mb-4"
						:class="error.statusCode === 404 ? 'text-blue-600' : 'text-red-600'"
					>
						{{ error.statusCode }}
					</h1>

					<h2 class="text-2xl font-semibold text-gray-900 mb-4">
						{{ errorTitle }}
					</h2>

					<p class="text-gray-600 text-lg mb-8">
						{{ errorDescription }}
					</p>
				</div>

				<div class="flex flex-col sm:flex-row gap-4 justify-center">
					<button
						type="button"
						tabindex="0"
						aria-label="Go back to previous page"
						class="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
						@click="handleGoBack"
						@keydown="(e) => handleKeyDown(e, handleGoBack)"
					>
						Go Back
					</button>

					<button
						type="button"
						tabindex="0"
						aria-label="Go to home page"
						class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
						@click="handleGoHome"
						@keydown="(e) => handleKeyDown(e, handleGoHome)"
					>
						Home
					</button>
				</div>

				<div
					v-if="error.statusCode === 500 && error.stack"
					class="mt-8 pt-8 border-t border-gray-200"
				>
					<details class="text-left">
						<summary
							class="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900 mb-2"
							tabindex="0"
							@keydown="
								(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault()
										const target = e.currentTarget as HTMLElement
										if (target?.parentElement) {
											const details =
												target.parentElement as HTMLDetailsElement
											details.open = !details.open
										}
									}
								}
							"
						>
							Error Details (Development Mode)
						</summary>
						<pre
							class="mt-4 p-4 bg-gray-100 rounded-lg text-xs text-gray-800 overflow-auto max-h-64"
							>{{ error.stack }}</pre
						>
					</details>
				</div>
			</div>
		</div>
	</div>
</template>
