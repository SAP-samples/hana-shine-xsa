const js = require('@eslint/js');
const globals = require('globals');

module.exports = [
	{
		ignores: [
			'.settings',
			'.project',
			'*.log',
			'node_modules',
			'node',
			'target',
			'etc',
			'package-lock.json'
		]
	},
	{
		files: ['**/*.js'],
		languageOptions: {
			ecmaVersion: 'latest',
			sourceType: 'commonjs',
			globals: globals.node
		},
		linterOptions: {
			noInlineConfig: true
		},
		rules: {
			...js.configs.recommended.rules,
			quotes: ['error', 'single'],
			semi: ['error', 'always'],
			eqeqeq: ['error', 'always'],
			'comma-dangle': ['error', 'never'],
			'no-trailing-spaces': ['error'],
 			camelcase: ['error', { properties: 'never' }]
		}
	}
];