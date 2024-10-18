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
import {
    describe, it, expect, beforeAll
} from 'vitest'

// ==== INTERNAL ====
import type { IFixtureDoc } from '@/src/FixturesManager'

describe('[UNIT TEST] - src/ModelUtils.ts', () => {
    let fixtureDoc: IFixtureDoc
    let fixtureDoc2: IFixtureDoc
    let fixtureDocDuplicated1: IFixtureDoc
    let fixtureDocDuplicated2: IFixtureDoc
     
    beforeAll(async() => {
        fixtureDoc = await import('@/test/fixtures/test/test.Test/0_test.ts') as IFixtureDoc
        fixtureDoc2 = await import('@/test/fixtures/test/test.Test/1_test.ts') as IFixtureDoc

        // Duplicated fixtures
        fixtureDocDuplicated1 = await import('@/test/fixtures/error/duplicated/0_test.ts') as IFixtureDoc
        fixtureDocDuplicated2 = await import('@/test/fixtures/error/duplicated/1_test.ts') as IFixtureDoc
    })

    describe('[SNAPSHOT]', () => {
        describe('[INVALID]', () => {
            describe('[DUPLICATED]', () => {
                it('should match the schema snapshot', () => {
                    expect(fixtureDocDuplicated1).toMatchSnapshot()
                    expect(fixtureDocDuplicated2).toMatchSnapshot()
                })
            })
        })

        describe('[VALID]', () => {
            it('should match the schema snapshot', () => {
                expect(fixtureDoc).toMatchSnapshot()
                expect(fixtureDoc2).toMatchSnapshot()
            })
        })
    })
})