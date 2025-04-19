// eslint.config.js
import js from '@eslint/js';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
    js.configs.recommended,
    {
        languageOptions: {
            ecmaVersion: 2022, // required for public class fields
            sourceType: 'module',
            globals: {
                console: 'readonly',
            },
        },
        rules: {
            'camelcase': [
                'warn',
                {
                    properties: 'never',
                    ignoreDestructuring: true,
                    allow: ['^([A-Z][a-zA-Z0-9]*_)+[A-Z][a-zA-Z0-9]*$'],
                },
            ],
            'indent': ['error', 4],
            'linebreak-style': ['error', 'unix'],
            'quotes': ['error', 'single'],
            'semi': ['error', 'always'],
        },
    },
    // Special rule override for interface declarations
    {
        files: ['./src/Api/**/*.js'],
        rules: {
            'no-unused-vars': 'off',
        },
    },
];
