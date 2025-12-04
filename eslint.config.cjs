// Flat config for ESLint v9 — configured for Angular + TypeScript + template linting.
// This file uses the new flat config format. It references installed plugins.
module.exports = [
	{ ignores: ["dist/**", "node_modules/**", "coverage/**", "src/test.ts", "e2e/**", "src/assets/**"] },
	{
		files: ["**/*.ts"],
			languageOptions: {
				parser: require("@typescript-eslint/parser"),
				parserOptions: {
				project: ["tsconfig.json", "src/tsconfig.app.json", "e2e/tsconfig.e2e.json"],
				createDefaultProgram: true
			}
		},
		plugins: {
			"@typescript-eslint": require("@typescript-eslint/eslint-plugin"),
			"@angular-eslint": require("@angular-eslint/eslint-plugin")
		},
		linterOptions: { reportUnusedDisableDirectives: true },
		rules: {
			"@typescript-eslint/no-explicit-any": "off",
			"no-console": "error",
			"@angular-eslint/directive-selector": ["error", { "type": "attribute", "prefix": "app", "style": "camelCase" }],
			"@angular-eslint/component-selector": ["error", { "type": "element", "prefix": "app", "style": "kebab-case" }]
		}
	},
	{
		files: ["**/*.html"],
			languageOptions: {
				parser: require("@angular-eslint/template-parser")
			},
		plugins: {
			"@angular-eslint/template": require("@angular-eslint/eslint-plugin-template")
		},
		rules: {}
	}
];
