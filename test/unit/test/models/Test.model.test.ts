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

// 🌐 ==== DEPENDENCIES ====
import {
    describe, it, expect, beforeAll
} from 'vitest'

// 🔗 ==== INTERNAL ====
import type { IModelCore } from '@/src/ModelManager'

/**
 * @description This module contains unit tests for the ModelUtils functionality.
 * It verifies the correctness of the model schema using snapshots.
 */
describe('[UNIT TEST] - src/ModelUtils.ts', () => {
    /** 
     * @description Details of the model core to be used in tests.
     */
    let modelCoreDetails: IModelCore

    /**
     * @description Sets up the model core details before running the tests.
     * This function imports the model details from the specified path.
     */
    beforeAll(async() => {
        // 📦 Importing the model for testing
        modelCoreDetails = await import('@/test/models/Test.model.mjs')
    })

    // 📸 ==== SNAPSHOT TESTS ====
    describe('[SNAPSHOT]', () => {
        /**
         * @description Tests that the model schema matches the saved snapshot.
         * This ensures that any changes to the model will be detected.
         */
        it('should match the schema snapshot', () => {
            // ✅ Expecting the schema to match the snapshot
            expect(modelCoreDetails.schema).toMatchSnapshot()
        })
    })
})
