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

// 🔧 ==== INTERNAL ====
import type { IFixtureDoc } from '@/src/FixturesManager'

/**
 * @module ModelUtils
 * @description Unit tests for the ModelUtils module using Vitest.
 * This suite tests various fixture documents.
 */
describe('[UNIT TEST] - src/ModelUtils.ts', () => {
    /** @type {IFixtureDoc} Fixture document for testing. */
    let fixtureDoc: IFixtureDoc
    
    /** @type {IFixtureDoc} Another fixture document for testing. */
    let fixtureDoc2: IFixtureDoc
    
    /** @type {IFixtureDoc} Duplicated fixture document for testing. */
    let fixtureDocDuplicated1: IFixtureDoc
    
    /** @type {IFixtureDoc} Another duplicated fixture document for testing. */
    let fixtureDocDuplicated2: IFixtureDoc
     
    /**
     * @description Loads fixture documents before running tests.
     */
    beforeAll(async() => {
        // 📂 Importing test fixture documents for validation.
        fixtureDoc = await import('@/test/fixtures/test/test.Test/0_test.mjs') as IFixtureDoc
        fixtureDoc2 = await import('@/test/fixtures/test/test.Test/1_test.mjs') as IFixtureDoc

        // 🔁 Duplicated fixtures
        fixtureDocDuplicated1 = await import('@/test/fixtures/error/duplicated/0_test.mjs') as IFixtureDoc
        fixtureDocDuplicated2 = await import('@/test/fixtures/error/duplicated/1_test.mjs') as IFixtureDoc
    })

    describe('[SNAPSHOT]', () => {
        describe('[INVALID]', () => {
            describe('[DUPLICATED]', () => {
                /**
                 * @description Tests that duplicated fixture documents match schema snapshots.
                 */
                it('should match the schema snapshot', () => {
                    // 📏 Validate duplicated fixture document snapshots.
                    expect(fixtureDocDuplicated1).toMatchSnapshot()
                    expect(fixtureDocDuplicated2).toMatchSnapshot()
                })
            })
        })

        describe('[VALID]', () => {
            /**
             * @description Tests that valid fixture documents match schema snapshots.
             */
            it('should match the schema snapshot', () => {
                // 📏 Validate valid fixture document snapshots.
                expect(fixtureDoc).toMatchSnapshot()
                expect(fixtureDoc2).toMatchSnapshot()
            })
        })
    })
})
