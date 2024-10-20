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
import sinon from 'sinon'
import mongoose from 'mongoose'
import {
    describe, it,
    expectTypeOf,
    beforeEach, beforeAll
} from 'vitest'

// 📜 ==== CODE TO TEST ====
import ModelManager, {
    type IModel, type IModelCore
} from '@/src/ModelManager'

import type { IMongooseSchema } from '@/test/models/Test.model.ts'

describe('[TYPE TEST] - src/ModelManager.ts', () => {
    let modelManager: ModelManager // 🤖 Instance of ModelManager to be tested
    // Must be set because we only use it as type here
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let modelDetails: IModel<any> // 📋 Details of the model for type checking

    // 📅 Before all tests, set up modelDetails
    beforeAll(() => {
        modelDetails = globalThis.modelDetails // 🗂️ Accessing global model details
    })

    // 🔄 Before each test, reset the model manager instance
    beforeEach(async() => {
        // 🔄 Reset instance before creating a new one
        Reflect.set(ModelManager, 'instance', undefined)

        sinon.stub( // 🧪 Stubbing init method of modelManager
            modelManager, 'init' as keyof ModelManager
        ).resolves()

        modelManager = await ModelManager.getInstance() // 📦 Getting the instance of ModelManager
    })

    describe('[INTERFACES]', () => {
        // 🌐 Interface definition for IModelCore_Test
        interface IModelCore_Test {
            /** 🏷️ The name of the model. */
            modelName: string
            /** 🗄️ The name of the database where the model is stored. */
            dbName: string
            /** 📜 The schema used for the model. */
            schema: mongoose.SchemaDefinition
        }

        // 🌐 Interface definition for IModel_Test
        interface IModel_Test<TSchema> extends IModelCore_Test {
            /** 🏗️ The Mongoose Model instance. */
            Model: mongoose.Model<TSchema>
        }

        describe('IModelCore', () => {
            it('should verify interface type', () => {
                // ✅ Checking if IModelCore matches IModelCore_Test
                expectTypeOf<IModelCore>().toEqualTypeOf<IModelCore_Test>()
            })
        })

        describe('IModel', () => {
            it('should verify interface type', () => {
                // ✅ Checking if IModel with IMongooseSchema matches IModel_Test
                expectTypeOf<IModel<IMongooseSchema>>()
                    .toEqualTypeOf<IModel_Test<IMongooseSchema>>()
            })
        })
    })

    describe('getInstance()', () => {
        it('should verify instance and return type', () => {
            // ✅ Verifying that modelManager is of type ModelManager
            expectTypeOf(modelManager).toEqualTypeOf<ModelManager>()
            // ✅ Verifying return type of getInstance method
            expectTypeOf(
                ModelManager.getInstance.bind(ModelManager)
            ).returns.resolves.toEqualTypeOf<ModelManager>()
        })
    })

    describe('[METHODS]', () => {
        describe('[PRIVATE]', () => {
            describe('init()', () => {
                it('should verify return type', () => {
                    // ✅ Verifying that init returns a void promise
                    expectTypeOf(modelManager['init']).returns.resolves.toBeVoid()
                })
            })

            describe('globModels()', () => {
                it('should verify parameter and return type', () => {
                    // ✅ Checking that the first parameter is a string
                    expectTypeOf(modelManager['globModels']).parameter(0).toBeString()
                    // ✅ Verifying that globModels returns an array of IModel
                    expectTypeOf(modelManager['globModels']).returns.resolves
                        .toEqualTypeOf<IModel<any>[]>()
                })
            })

            describe('pushModel()', () => {
                it('should verify parameter and return type', () => {
                    // ✅ Checking that the first parameter is of type IModel
                    expectTypeOf(
                        modelManager['pushModel']<IMongooseSchema>
                    ).parameter(0).toEqualTypeOf<IModel<IMongooseSchema>>()

                    // ✅ Verifying that pushModel returns void
                    expectTypeOf(modelManager['pushModel']).returns.toBeVoid()
                })
            })
        })

        describe('[PUBLIC]', () => {
            describe('getModels()', () => {
                it('should verify return type', () => {
                    // ✅ Verifying that getModels returns an array of IModel
                    expectTypeOf(modelManager['getModels']).returns
                        .toEqualTypeOf<IModel<any>[]>()
                })
            })

            describe('getModel()', () => {
                it('should verify parameter and return type', () => {
                    // ✅ Checking that the first parameter is a string
                    expectTypeOf(modelManager['globModels']).parameter(0).toBeString()
                    // ✅ Verifying that getModel returns an IModel
                    expectTypeOf(modelManager['getModel']).returns
                        .toEqualTypeOf<IModel<any>>()
                })
            })

            describe('createModel()', () => {
                it('should verify parameter and return type', () => {
                    // ✅ Checking that the first parameter is of type IModelCore
                    expectTypeOf(
                        modelManager.createModel.bind(modelManager)<IMongooseSchema>
                    ).parameter(0).toEqualTypeOf<IModelCore>()

                    // ✅ Verifying that createModel returns a Mongoose Model
                    expectTypeOf(
                        modelManager.createModel.bind(modelManager)<IMongooseSchema>
                    ).returns.resolves.toEqualTypeOf<mongoose.Model<IMongooseSchema>>()
                })
            })
        })
    })
})
