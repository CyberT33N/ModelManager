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

// ⚙️ Import necessary functions from vitest
import { defineConfig, mergeConfig } from 'vitest/config'

// 📜 Import the base Vitest configuration
import vitestConfig from './vitest.config'

/**
 * @description Merges the base Vitest configuration with custom test settings.
 * @returns {import('vitest/config').UserConfig} The merged Vitest configuration.
 */
export default mergeConfig(vitestConfig, defineConfig({
    test: {
        // 📂 Paths to include test files
        include: ['test/unit/**/*.test.ts'],
        
        // 🛠️ Setup file to prepare the testing environment
        setupFiles: 'test/unit/pretestEach.ts',
        
        // ⏳ Disable watching for changes during tests
        watch: false,
        
        // 📊 Configuration for coverage reports
        coverage: {
            // ❌ Exclude specific files from coverage calculations
            exclude: ['**/route.ts']
        }
    }
}))
