/*
███████████████████████████████████████████████████████████████████████████████
██******************** PRESENTED BY t33n Software ***************************██
██                                                                           ██
██                  ████████╗██████╗ ██████╗ ███╗   ██╗                      ██
██                  ╚══██╔══╝╚════██╗╚════██╗████╗  ██║                      ██
██                     ██║    █████╔╝ █████╔╝██╔██╗ ██║                      ██
██                     ██║    ╚═══██╗ ╚═══██╗██║╚██╗██║                      ██
██                     ██║   ██████╔╝██████╔╝██║ ╚████║                      ██
██                     ╚═╝   ╚═════╝ ╚═════╝ ╚═╝  ╚═══╝                      ██
██                                                                           ██
███████████████████████████████████████████████████████████████████████████████
███████████████████████████████████████████████████████████████████████████████
*/

import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'

/**
 * ESLint configuration for the project.
 * @module eslintConfig
 * @returns {Object} ESLint configuration object.
 */
export default tseslint.config(
    // ===== ESLINT RULES =====
    {
        // 📝 Merging recommended ESLint configurations
        ...eslint.configs.recommended,
        rules: {
            // 📝 Merging recommended ESLint rules
            ...eslint.configs.recommended.rules,

            // 🛠️ Enforcing arrow function parentheses only as needed
            'arrow-parens': ['error', 'as-needed'],
            // 🚫 Disallowing the use of var
            'no-var': 1,
            // 🚫 Disallowing eval() function
            'no-eval': 'error',
            // 🔤 Enforcing consistent indentation of 4 spaces
            indent: ['error', 4],
            // 🔍 Enforcing the use of single quotes
            quotes: ['error', 'single'],
            // 🚫 Allowing console statements
            'no-console': 'off',
            // ⏳ Disallowing space before function parentheses
            'space-before-function-paren': ['error', 'never'],
            // 📦 Disallowing padded blocks
            'padded-blocks': ['error', 'never'],

            // 💡 Allowing named functions for prefer-arrow-callback
            'prefer-arrow-callback': [0, {
                allowNamedFunctions: true
            }],

            // 🔒 Disallowing named function expressions
            'func-names': ['error', 'never'],

            // 🚦 Disallowing the use of variables before they are defined
            'no-use-before-define': ['error', {
                functions: true,
                classes: true
            }],

            // 📏 Enforcing a maximum line length of 120 characters
            'max-len': ['error', 120],
            // 🌈 Disallowing object curly spacing
            'object-curly-spacing': 0,
            // 🔗 Disallowing trailing commas
            'comma-dangle': ['error', 'never'],
            // 🚫 Enforcing no semicolons at the end of statements
            semi: [2, 'never'],
            // 🚫 Disallowing new-cap for constructor functions
            'new-cap': 0,
            // 🚫 Disallowing multiple variable declarations
            'one-var': 0,
            // 🚫 Disallowing for-in loops without hasOwnProperty check
            'guard-for-in': 0
        }
    },

    // ===== TSESLINT RULES =====
    ...tseslint.configs.stylisticTypeChecked, // 📝 Using stylistic TypeScript ESLint rules
    ...tseslint.configs.recommendedTypeChecked, // 📝 Using recommended TypeScript ESLint rules
    {
        languageOptions: {
            parserOptions: {
                // 📝 Enabling project service for TypeScript
                projectService: true,
                tsconfigRootDir: import.meta.dirname // 📝 Setting TypeScript config root directory
            }
        }
    },
    // ...tseslint.configs.recommended,
    // ...tseslint.configs.strictTypeChecked,
    //...tseslint.configs.stylisticTypeChecked

    {
        rules: {
            // 🚫 Allowing explicit 'any' type for Model<any>
            '@typescript-eslint/no-explicit-any': 'off',
            // 🚫 Allowing empty functions for singleton pattern
            '@typescript-eslint/no-empty-function': 'off',
            // 🚫 Allowing dot notation for private properties
            '@typescript-eslint/dot-notation': 'off',
            // 📦 Allowing records and index types
            '@typescript-eslint/consistent-indexed-object-style': 'off'
        }
    }
)
