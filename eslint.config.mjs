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

export default tseslint.config(
    // ===== ESLINT RULES =====
    {
        ...eslint.configs.recommended,
        rules: {
            ...eslint.configs.recommended.rules,

            // Hier fügst du deine neue Regel hinzu
            'arrow-parens': ['error', 'as-needed'],
            'no-var': 1,
            'no-eval': 'error',
            indent: ['error', 4],
            quotes: ['error', 'single'],
            'no-console': 'off',
            'space-before-function-paren': ['error', 'never'],
            'padded-blocks': ['error', 'never'],

            'prefer-arrow-callback': [0, {
                allowNamedFunctions: true
            }],

            'func-names': ['error', 'never'],

            'no-use-before-define': ['error', {
                functions: true,
                classes: true
            }],

            'max-len': ['error', 120],
            'object-curly-spacing': 0,
            'comma-dangle': ['error', 'never'],
            semi: [2, 'never'],
            'new-cap': 0,
            'one-var': 0,
            'guard-for-in': 0
        }
    },

    // ===== TSESLINT RULES =====
    ...tseslint.configs.stylisticTypeChecked,
    ...tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname
            }
        }
    },
    // ...tseslint.configs.recommended,
    // ...tseslint.configs.strictTypeChecked,
    //...tseslint.configs.stylisticTypeChecked

    {
        rules: {
            // Must be used for Model<any>
            '@typescript-eslint/no-explicit-any': 'off',
            // '@typescript-eslint/no-unsafe-assignment': 'off',

            // Disable for private constructor where we use it for singleton pattern
            '@typescript-eslint/no-empty-function': 'off',

            // Disable for accessing private properties e.g. ModelManager['instance']
            '@typescript-eslint/dot-notation': 'off',

            // Allowing records and index types
            '@typescript-eslint/consistent-indexed-object-style': 'off'
        }
    }
)