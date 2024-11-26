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
    IMemoryModel, // 🔍 Memory model interface
    IFixtureDoc, // 🔍 Fixture document interface
    IFixtureInserted, // 🔍 Inserted fixture interface
    IFixture, // 🔍 Combined fixture interface
    IFixtures // 🔍 Fixtures interface
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

        /**
         * 📦 Testing FixturesManager related interfaces
         */
        describe('[FixturesManager]', () => {
            // ✅ Test to ensure all Fixture interfaces exist
            it('should have all Fixture interfaces', () => {
                expectTypeOf<IFixtureDoc>().not.toBeUndefined()
                expectTypeOf<IFixtureInserted>().not.toBeUndefined()
                expectTypeOf<IFixture>().not.toBeUndefined()
                expectTypeOf<IFixtures<any>>().not.toBeUndefined()
            })
        })
    })
})
