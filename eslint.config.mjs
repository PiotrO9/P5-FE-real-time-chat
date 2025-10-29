import withNuxt from './.nuxt/eslint.config.mjs'
import prettier from 'eslint-plugin-prettier/recommended'

export default withNuxt(
	{
		rules: {
			'vue/multi-word-component-names': 'off',
			'vue/no-v-html': 'off',
			'vue/block-order': [
				'error',
				{
					order: ['script', 'template', 'style']
				}
			],
			'@typescript-eslint/no-explicit-any': 'off',
			'no-console': 'off',
			'prettier/prettier': [
				'error',
				{
					useTabs: true,
					tabWidth: 4,
					semi: false,
					singleQuote: true,
					trailingComma: 'none',
					printWidth: 100,
					arrowParens: 'always',
					endOfLine: 'lf'
				}
			]
		}
	},
	prettier
)
