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
     
    beforeAll(async() => {
        fixtureDoc = await import('@/test/fixtures/test/test.Test/0_test.ts') as IFixtureDoc
        fixtureDoc2 = await import('@/test/fixtures/test/test.Test/1_test.ts') as IFixtureDoc
    })

    describe('[SNAPSHOT]', () => {
        it('should match the schema snapshot', () => {
            expect(fixtureDoc).toMatchSnapshot()
            expect(fixtureDoc2).toMatchSnapshot()
        })
    })
})