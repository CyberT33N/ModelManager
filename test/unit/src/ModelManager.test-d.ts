/* eslint-disable  @typescript-eslint/no-explicit-any */
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
import sinon from 'sinon'
import mongoose from 'mongoose'
import {
    describe, it,
    expectTypeOf,
    beforeEach, afterEach, beforeAll
} from 'vitest'

// ==== CODE TO TEST ====
import ModelManager, {
    type IModel, type IModelCore
} from '@/src/ModelManager'

describe('[TYPE TEST] - src/ModelManager.ts', () => {
    let modelManager: ModelManager
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    let schema: mongoose.SchemaDefinition
    let initStub: sinon.SinonStub

    beforeAll(async() => {
        const modelCoreDetails: IModelCore = await import('@/test/models/Test.model.mjs')
        schema = modelCoreDetails.schema
    })

    beforeEach(async() => {
        // Reset instance before creating a new one
        ModelManager['instance'] = null

        initStub = sinon.stub(
            ModelManager.prototype, 'init' as keyof ModelManager
        ).resolves()

        modelManager = await ModelManager.getInstance()
    })

    afterEach(() => {
        initStub.restore()
    })

    describe('[INTERFACES]', () => {
        interface IModelCore_Test {
            /** The name of the model. */
            modelName: string
            /** The name of the database where the model is stored. */
            dbName: string
            /** The schema used for the model. */
            schema: mongoose.SchemaDefinition
        }

        interface IModel_Test<TSchema> extends IModelCore_Test{
            /** The Mongoose Model instance. */
            Model: mongoose.Model<TSchema>
        }

        describe('IModelCore', () => {
            it('should verify interface type', () => {
                ; expectTypeOf<IModelCore>().toEqualTypeOf<IModelCore_Test>()
            })
        })

        describe('IModel', () => {
            it('should verify interface type', () => {
                type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>
                    ; expectTypeOf<IModel<TMongooseSchema>>()
                    .toEqualTypeOf<IModel_Test<TMongooseSchema>>()
            })
        })
    })

    describe('getInstance()', () => {
        it('should verify instance and return type', () => {
            expectTypeOf(modelManager).toEqualTypeOf<ModelManager>()
            expectTypeOf(ModelManager.getInstance).returns.resolves.toEqualTypeOf<ModelManager>()
        })
    })

    describe('[METHODS]', () => {
        describe('[PRIVATE]', () => {
            describe('init()', () => {
                it('should verify return type', async() => {
                    expectTypeOf(modelManager['init']).returns.resolves.toBeVoid()
                })
            })

            describe('globModels()', () => {
                it('should verify parameter and return type', async() => {
                    expectTypeOf(modelManager['globModels']).parameter(0).toBeString()
                    expectTypeOf(modelManager['globModels']).returns.resolves
                        .toEqualTypeOf<IModel<any>[]>()
                })
            })
        })

        describe('[PUBLIC]', () => {
            describe('getModels()', () => {
                it('should verify return type', async() => {
                    expectTypeOf(modelManager['getModels']).returns
                        .toEqualTypeOf<IModel<any>[]>()
                })
            })

            describe('getModel()', () => {
                it('should verify parameter and return type', async() => {
                    expectTypeOf(modelManager['globModels']).parameter(0).toBeString()
                    expectTypeOf(modelManager['getModel']).returns
                        .toEqualTypeOf<IModel<any> | undefined>()
                })
            })

            describe('createModel()', () => {
                it('should verify parameter and return type', async() => {
                    type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>

                    expectTypeOf(
                        modelManager.createModel<TMongooseSchema>
                    ).parameter(0).toEqualTypeOf<IModelCore>()

                    expectTypeOf(
                        modelManager.createModel<TMongooseSchema>
                    ).returns.resolves.toEqualTypeOf<mongoose.Model<TMongooseSchema>>()
                })
            })
        })
    })
})
