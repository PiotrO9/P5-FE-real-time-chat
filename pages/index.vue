<script setup lang="ts"></script>

<template>
	<div class="flex items-center justify-center min-h-screen">
		<div class="text-center">
			<h1 class="text-4xl font-bold text-gray-900 mb-4">Witaj w Nuxt 3!</h1>
			<p class="text-lg text-gray-600 mb-8">TypeScript + Tailwind CSS</p>
			<div class="flex gap-4 justify-center flex-wrap">
				<NuxtLink
					to="/websocket-example"
					class="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
					tabindex="0"
					aria-label="Przykład WebSocket"
				>
					WebSocket Demo
				</NuxtLink>
				<a
					href="https://nuxt.com/docs"
					target="_blank"
					rel="noopener noreferrer"
					class="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
					tabindex="0"
					aria-label="Otwórz dokumentację Nuxt"
				>
					Dokumentacja
				</a>
				<a
					href="https://tailwindcss.com/docs"
					target="_blank"
					rel="noopener noreferrer"
					class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
					tabindex="0"
					aria-label="Otwórz dokumentację Tailwind"
				>
					Tailwind CSS
				</a>
			</div>
		</div>
	</div>
</template>

<style scoped></style>
