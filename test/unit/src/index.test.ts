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

/**
 * 🧪 Imports necessary testing utilities and modules under test.
 */
import { describe, it, expect } from 'vitest'
import {
    ModelManager,
    MongooseUtils,
    ModelUtils,
    FixturesManager,
    MongoMemoryServer
} from '@/src/index'

/**
 * 📚 Test suite for the main index file of the project.
 * @namespace IndexTests
 */
describe('[UNIT TEST] - src/index.ts', () => {
    /**
     * 🧬 Subset of tests focusing on the code structure and exports.
     */
    describe('[CODE]', () => {
        /**
         * ✅ Verifies the presence of the ModelManager class in the exports.
         */
        it('should have ModelManager class', () => {
            expect(ModelManager).toBeDefined()
        })
        
        /**
         * ✅ Checks if the MongooseUtils class is correctly exported.
         */
        it('should have MongooseUtils class', () => {
            expect(MongooseUtils).toBeDefined()
        })
        
        /**
         * ✅ Ensures the ModelUtils class is available in the exports.
         */
        it('should have ModelUtils class', () => {
            expect(ModelUtils).toBeDefined()
        })

        describe('[FixturesManager]', () => {
            /**
             * ✅ Ensures the FixturesManager class is available in the exports.
             */
            it('should have FixturesManager class', () => {
                expect(FixturesManager).toBeDefined()
            })

            it('should have MongoMemoryServer export', () => {
                expect(MongoMemoryServer).toBeDefined()
            })
        })
    })
})