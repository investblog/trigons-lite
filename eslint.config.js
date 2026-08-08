// Flat config (ESLint 9+). Vanilla browser library, ES5 IIFE, zero dependencies.
// CommonJS on purpose: package.json has no "type": "module".
module.exports = [
	{
		// generated build output — never lint it
		ignores: ['trigons-lite.min.js'],
	},
	{
		files: ['**/*.js'],
		languageOptions: {
			ecmaVersion: 5,
			sourceType: 'script',
			globals: {
				window: 'readonly',
				document: 'readonly',
				requestAnimationFrame: 'readonly',
				cancelAnimationFrame: 'readonly',
				getComputedStyle: 'readonly',
				performance: 'readonly',
				devicePixelRatio: 'readonly',
				setTimeout: 'readonly',
				clearTimeout: 'readonly',
				module: 'writable',
			},
		},
		rules: {
			'no-undef': 'error',
			'no-unused-vars': 'error',
			'no-redeclare': 'error',
		},
	},
];
