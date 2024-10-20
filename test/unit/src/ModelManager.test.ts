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
import { ValidationError, ResourceNotFoundError } from 'error-manager-helper'
import {
    describe, it, expect, assert,
    beforeAll,
    beforeEach
} from 'vitest'

// ==== INTERNAL ====
import MongooseUtils from '@/src/MongooseUtils'

// ==== CODE TO TEST ====
import ModelManager, { type IModel } from '@/src/ModelManager'
import type { IMongooseSchema } from '@/test/models/Test.model.ts'

describe('[UNIT TEST] - src/ModelManager.ts', () => {
    let modelManager: ModelManager
    let initStub: sinon.SinonStub
    let modelDetails: IModel<any>

    beforeAll(() => {
        modelDetails = globalThis.modelDetails
    })

    beforeEach(async() => {
        // Reset instance before creating a new one
        Reflect.set(ModelManager, 'instance', undefined)

        initStub = sinon.stub(
            ModelManager.prototype, 'init' as keyof ModelManager
        ).resolves()

        modelManager = await ModelManager.getInstance()
    })

    describe('getInstance()', () => {
        it('should create new instance', () => {
            expect(initStub.calledOnce).toBe(true)
            expect(modelManager).toBeInstanceOf(ModelManager)
            expect(modelManager.models).toEqual([])
        })

        it('should return existing instance', async() => {
            const modelManager2 = await ModelManager.getInstance()
            expect(initStub.calledOnce).toBe(true)
            expect(modelManager2.models).toEqual([])
            expect(modelManager2).toBeInstanceOf(ModelManager)
        })
    })

    describe('[METHODS]', () => {
        describe('[PRIVATE]', () => {
            describe('init()', () => {
                let globModelsStub: sinon.SinonStub

                beforeEach(() => {
                    // In order to call init method, we need to restore the stub
                    initStub.restore()

                    globModelsStub = sinon.stub(
                        ModelManager.prototype, 'globModels' as keyof ModelManager
                    ).resolves([])
                })

                it('should initialize models if not already initialized', async() => {
                    await modelManager['init']()

                    expect(modelManager.models).toEqual([])
                    expect(
                        globModelsStub.calledOnceWithExactly(`${process.cwd()}/**/*.model.mjs`)
                    ).toBe(true)
                })

                it('should not initialize models if already initialized', async() => {
                    modelManager.models = [modelDetails]

                    await modelManager['init']()
                    
                    expect(globModelsStub.called).toBe(false)
                    expect(modelManager.models).toEqual([modelDetails])
                })
            })

            describe('globModels()', () => {
                let createModelStub: sinon.SinonStub

                beforeEach(() => {
                    createModelStub = sinon.stub(ModelManager.prototype, 'createModel')
                        .resolves(modelDetails.Model)
                })

                it('should return an array of globbed models', async() => {
                    const { modelName, dbName, schema } = modelDetails
                    const expression = `${process.cwd()}/test/models/**/*.model.mjs`

                    const globbedModels = await modelManager['globModels'](expression)

                    // ==== SPIES ====
                    expect(createModelStub.calledOnceWithExactly({
                        modelName, schema, dbName
                    })).toBe(true)

                    // ==== EXPECTS ====
                    expect(globbedModels).toEqual([modelDetails])
                })
    
                it('should return an empty array because no model can be found', async() => {
                    const expression = `${process.cwd()}/**/*.modelNotFound.test.ts`
                    const result = await modelManager['globModels'](expression)
                    expect(result).toEqual([])
                })
            })

            describe('pushModel()', () => {
                it('should add a new model to the instance models', () => {
                    modelManager['pushModel'](modelDetails)
                    expect(modelManager.models).toEqual([modelDetails])
                })

                it('should throw an error if a model with the same name already exists', () => {
                    modelManager.models = [modelDetails]

                    try {
                        modelManager['pushModel'](modelDetails)
                        assert.fail('This line should not be reached')
                    } catch (err) {
                        if (err instanceof ValidationError) {
                            expect(err.message).toBe(
                                `Model '${modelDetails.modelName}' already exists.`
                            )
                            
                            return
                        }
            
                        assert.fail('This line should not be reached')
                    }
                })
            })
        })

        describe('[PUBLIC]', () => {
            describe('getModels()', () => {
                beforeEach(() => {
                    modelManager.models = [modelDetails]
                })

                it('should return all models', () => {
                    const models = modelManager.getModels()
                    expect(models).toEqual([modelDetails])
                })
            })

            describe('getModel()', () => {
                describe('[ERROR]', () => {
                    it('should throw error if the model with the specified name is not found', () => {
                        try {
                            modelManager.getModel('not-found')
                            assert.fail('This line should not be reached')
                        } catch (err) {
                            if (err instanceof ResourceNotFoundError) {
                                expect(err.message).toEqual(
                                    '[Model Manager] - Model \'not-found\' not found.'
                                )

                                return
                            }

                            assert.fail('This line should not be reached')
                        }
                    })
                })
                describe('[SUCCESS]', () => {
                    it('should return the model with the specified name', () => {
                        modelManager.models = [modelDetails]

                        const result = modelManager.getModel(modelDetails.modelName)
                        expect(result).toEqual(modelDetails)
                    })
                })
            })

            describe('createModel()', () => {
                let mongooseUtilsGetInstanceStub: sinon.SinonStub
                let mongooseUtilsCreateModelStub: sinon.SinonStub
                let modelCreateIndexesStub: sinon.SinonStub
            
                beforeEach(() =>{
                    mongooseUtilsCreateModelStub = sinon.stub().resolves(modelDetails.Model)

                    mongooseUtilsGetInstanceStub = sinon.stub(MongooseUtils, 'getInstance').returns({
                        createModel: mongooseUtilsCreateModelStub
                    } as unknown as MongooseUtils)
                    
                    modelCreateIndexesStub = sinon.stub(modelDetails.Model, 'createIndexes').resolves()
                })
            
                it('should create a new mongoose model and call createIndexes()', async() => {
                    const { modelName, schema, dbName, Model } = modelDetails

                    const createdModel = await modelManager.createModel<IMongooseSchema>({
                        modelName, schema, dbName
                    })
            
                    // ==== SPIES ====
                    expect(
                        mongooseUtilsGetInstanceStub.calledOnceWithExactly(dbName)
                    ).toBe(true)
                    expect(
                        mongooseUtilsCreateModelStub.calledOnceWithExactly(schema, modelName)
                    ).toBe(true)
                    expect(modelCreateIndexesStub.calledOnce).toBe(true)
            
                    // ==== EXPECTS ====
                    expect(createdModel).toEqual(Model)
                    expect(
                        modelManager.models.find(model => model.modelName === modelName)
                    ).toEqual(modelDetails)
                })
            })
        })
    })
})
