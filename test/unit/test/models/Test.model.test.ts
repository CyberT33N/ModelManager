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
import type { IModelCore } from '@/src/ModelManager'

describe('[UNIT TEST] - src/ModelUtils.ts', () => {
    let modelCoreDetails: IModelCore
     
    beforeAll(async() => {
        modelCoreDetails = await import('@/test/models/Test.model.mjs')
    })

    describe('[SNAPSHOT]', () => {
        it('should match the schema snapshot', () => {
            expect(modelCoreDetails.schema).toMatchSnapshot()
        })
    })
})