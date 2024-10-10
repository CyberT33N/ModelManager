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
import { describe, it, expectTypeOf } from 'vitest'

import type { 
    IModelCore, IModel,
    IMemoryModel
} from '@/src/index'

describe('[TYPE TEST] - src/index.ts', () => {
    describe('[INTERFACES]', () => {
        describe('[ModelManager]', () => {
            it('should have the interface IModelCore', () => {
                expectTypeOf<IModelCore>().not.toBeUndefined()
            })

            it('should have the interface IModel', () => {
                expectTypeOf<IModel<any>>().not.toBeUndefined()
            })
        })

        describe('[ModelUtils]', () => {
            it('should have the interface IMemoryModel', () => {
                expectTypeOf<IMemoryModel<any>>().not.toBeUndefined()
            })
        })
    })
})