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
    describe, it, expect,
    expectTypeOf,
    beforeEach, afterEach, beforeAll
} from 'vitest'

// ==== CODE TO TEST ====
import ModelManager, {
    type IModel, type IModelCore
} from '@/src/ModelManager'

describe('[TYPE TEST] - src/ModelManager.ts',() => {
    let modelDetails: IModel<any>
    let schema: mongoose.SchemaDefinition<any>

    let modelManager: ModelManager

    let initStub: sinon.SinonStub

    beforeAll(async () => {
        const modelCoreDetails: IModelCore<any> = await import('@/test/models/Test.model.mjs')

        // Generate the Mongoose schema type
        type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>
        ;schema = modelCoreDetails.schema as mongoose.SchemaDefinition<TMongooseSchema>
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
                        .toEqualTypeOf<IModel<mongoose.SchemaDefinition<{}>>[]>()
                })
            })
        })

        describe('[PUBLIC]', () => {
            describe('getModels()', () => {
                it('should verify return type', async() => {
                    expectTypeOf(modelManager['getModels']).returns
                        .toEqualTypeOf<IModel<mongoose.SchemaDefinition<{}>>[]>()
                })
            })

            describe('getModel()', () => {
                it('should verify parameter and return type', async() => {
                    expectTypeOf(modelManager['globModels']).parameter(0).toBeString()
                    expectTypeOf(modelManager['getModel']).returns
                        .toEqualTypeOf<IModel<mongoose.SchemaDefinition<{}>> | undefined>()
                })
            })

            describe('createModel()', () => {
                it('should verify parameter and return type', async() => {
                    const { schema  } = modelDetails

                    type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>

                    expectTypeOf(
                        modelManager.createModel<TMongooseSchema>
                    ).parameter(0).toEqualTypeOf<IModelCore<TMongooseSchema>>()

                    expectTypeOf(
                        modelManager.createModel<TMongooseSchema>
                    ).returns.resolves.toEqualTypeOf<mongoose.Model<TMongooseSchema>>()
                })
            })
        })
    })
})
