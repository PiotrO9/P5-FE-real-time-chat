// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
	compatibilityDate: '2024-04-03',
	devtools: { enabled: true },

	devServer: {
		port: 3001
	},

	modules: ['@nuxtjs/tailwindcss', '@vueuse/nuxt', '@nuxt/eslint'],

	typescript: {
		strict: true,
		typeCheck: true
	},

	css: ['~/assets/css/tailwind.css'],

	runtimeConfig: {
		public: {
			socketUrl: process.env.NUXT_PUBLIC_SOCKET_URL || 'http://localhost:3000'
		}
	}
})
