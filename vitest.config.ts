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

// 🌐 Import dotenv to load environment variables from .env files
import dotenv from 'dotenv'

// 🔧 Load the default environment variables from the .env file
dotenv.config()

// 🔄 Load the test environment variables from .env.test and override defaults
dotenv.config({ path: '.env.test', override: true })

// === DEPENDENCIES ===
// 📦 Import tsconfigPaths for TypeScript path resolution
import tsconfigPaths from 'vite-tsconfig-paths'
// 🔍 Import defineConfig from vitest/config to define Vitest configuration
import { defineConfig } from 'vitest/config'

/**
 * Represents the configuration for the Vitest test runner.
 * @returns {import('vitest/config').UserConfig} The Vitest configuration object.
 */
export default defineConfig({
    // ⚙️ Plugins to be used in the Vitest configuration
    plugins: [tsconfigPaths()],
    test: {
        // 🔍 Disable watch mode during testing
        watch: false,
        // 📝 Specify the setup file to run before each test
        setupFiles: 'test/unit/pretestEach.ts',
        // 📚 globalSetup: 'test/pretestAll.ts', // Uncomment if needed
        // 🌐 Set the testing environment to Node
        environment: 'node',
        typecheck: {
            // 🔍 Specify files to include for type checking
            include: ['**/*.{test,spec}.?(c|m)[jt]s?(x)']
        },
        coverage: {
            /**
             * Specifies the directories to include for coverage.
             * @type {string[]}
             */
            include: ['src/'],

            /**
             * Specifies the files or directories to exclude from coverage.
             * @type {string[]}
             */
            // exclude: ['src/legacy/', 'utils/helpers.ts'], // Uncomment if needed

            /**
             * Specifies the coverage reporters to use.
             * @type {string[]}
             */
            reporter: ['text', 'json', 'html']
        }
    }
})
