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

// 🛠️ ==== DEPENDENCIES ====
import { describe, it, expectTypeOf } from 'vitest'

// 📜 Importing types from the main module
import type { 
    IModelCore, // 🔍 Core model interface
    IModel,     // 🔍 Generic model interface
    IMemoryModel // 🔍 Memory model interface
} from '@/src/index'

// 🧪 Type Tests for src/index.ts
describe('[TYPE TEST] - src/index.ts', () => {
    // 📚 Testing Interfaces
    describe('[INTERFACES]', () => {
        // 📦 Testing ModelManager Interface
        describe('[ModelManager]', () => {
            // ✅ Test to ensure IModelCore interface exists
            it('should have the interface IModelCore', () => {
                expectTypeOf<IModelCore>().not.toBeUndefined()
            })

            // ✅ Test to ensure IModel interface exists
            it('should have the interface IModel', () => {
                expectTypeOf<IModel<any>>().not.toBeUndefined()
            })
        })

        // 📦 Testing ModelUtils Interface
        describe('[ModelUtils]', () => {
            // ✅ Test to ensure IMemoryModel interface exists
            it('should have the interface IMemoryModel', () => {
                expectTypeOf<IMemoryModel<any>>().not.toBeUndefined()
            })
        })
    })
})
