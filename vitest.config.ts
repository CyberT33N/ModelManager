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

// ==== DEPENDENCIES ====
import tsconfigPaths from 'vite-tsconfig-paths'

// ==== VITEST ====
import { defineConfig } from 'vitest/config'

/**
 * Represents the configuration for the Vitest test runner.
 */
export default defineConfig({
    plugins: [tsconfigPaths()],
    test: {
        watch: false,
        setupFiles: 'test/unit/pretestEach.ts',
        globalSetup: 'test/integration/pretestAll.ts',
        environment: 'node',
        coverage: {
            /**
             * Specifies the directories to include for coverage.
             */
            include: ['src/'],
            /**
             * Specifies the files or directories to exclude from coverage.
             */
            //exclude: ['src/legacy/', 'utils/helpers.ts'],
            /**
             * Specifies the coverage reporters to use.
             */
            reporter: ['text', 'json', 'html']
        }
    }
})


