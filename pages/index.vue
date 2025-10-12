<template>
	<div class="flex items-center justify-center min-h-screen">
		<div class="text-center">
			<h1 class="text-2xl font-bold text-gray-900 mb-4">Real-Time Chat</h1>
			<p class="text-gray-600 mb-6">Witaj na stronie głównej!</p>
			<div class="flex gap-4 justify-center">
				<NuxtLink
					to="/login"
					class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
				>
					Zaloguj się
				</NuxtLink>
				<NuxtLink
					to="/register"
					class="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
				>
					Zarejestruj się
				</NuxtLink>
			</div>
		</div>
	</div>
</template>
