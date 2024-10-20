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

/**
 * @module ModelManagerTests
 * @description Unit tests for the ModelManager class.
 */
describe('[UNIT TEST] - src/ModelManager.ts', () => {
    /** @type {ModelManager} Instance of ModelManager. */
    let modelManager: ModelManager

    /** @type {sinon.SinonStub} Stub for the init method. */
    let initStub: sinon.SinonStub

    /** @type {IModel<any>} Model details from the global context. */
    let modelDetails: IModel<any>

    /**
     * @function beforeAll
     * @description Initializes model details before all tests run.
     */
    beforeAll(() => {
        modelDetails = globalThis.modelDetails
    })

    /**
     * @description Resets the ModelManager instance and stubs the init method 
     * before each test.
     */
    beforeEach(async() => {
        // ⚙️ Reset instance before creating a new one
        Reflect.set(ModelManager, 'instance', undefined)

        // 🥽 Stub the init method of ModelManager
        initStub = sinon.stub(
            ModelManager.prototype, 'init' as keyof ModelManager
        ).resolves()

        // 🔍 Get instance of ModelManager
        modelManager = await ModelManager.getInstance()
    })

    /**
     * @function getInstance
     * @description Tests the getInstance method of ModelManager.
     */
    describe('getInstance()', () => {
        it('should create new instance', () => {
            // 🆕 Check if init method was called once
            expect(initStub.calledOnce).toBe(true)

            // 📦 Ensure modelManager is an instance of ModelManager
            expect(modelManager).toBeInstanceOf(ModelManager)

            // 🔢 Ensure models are initialized to an empty array
            expect(modelManager.models).toEqual([])
        })

        it('should return existing instance', async() => {
            // 🔄 Get another instance of ModelManager
            const modelManager2 = await ModelManager.getInstance()

            // 🔄 Verify init was called only once
            expect(initStub.calledOnce).toBe(true)

            // 🔢 Ensure models remain an empty array
            expect(modelManager2.models).toEqual([])

            // 📦 Ensure modelManager2 is an instance of ModelManager
            expect(modelManager2).toBeInstanceOf(ModelManager)
        })
    })

    describe('[METHODS]', () => {
        describe('[PRIVATE]', () => {
            describe('init()', () => {
                /** @type {sinon.SinonStub} Stub for the globModels method. */
                let globModelsStub: sinon.SinonStub

                /**
                 * @function beforeEach
                 * @description Restores the init stub and stubs the globModels method 
                 * before each test.
                 */
                beforeEach(() => {
                    // 🔄 Restore the init method stub
                    initStub.restore()

                    // 🗂️ Stub the globModels method of ModelManager
                    globModelsStub = sinon.stub(
                        ModelManager.prototype, 'globModels' as keyof ModelManager
                    ).resolves([])
                })

                it('should initialize models if not already initialized', async() => {
                    // 🔄 Call the init method
                    await modelManager['init']()

                    // 🔢 Ensure models are initialized to an empty array
                    expect(modelManager.models).toEqual([])

                    // 🔍 Verify globModels was called with correct path
                    expect(
                        globModelsStub.calledOnceWithExactly(`${process.cwd()}/**/*.model.mjs`)
                    ).toBe(true)
                })

                it('should not initialize models if already initialized', async() => {
                    // 📦 Assign modelDetails to models
                    modelManager.models = [modelDetails]

                    // 🔄 Call the init method again
                    await modelManager['init']()

                    // 🚫 Verify globModels was not called again
                    expect(globModelsStub.called).toBe(false)

                    // 🔢 Ensure models remain the same
                    expect(modelManager.models).toEqual([modelDetails])
                })
            })

            describe('globModels()', () => {
                /** @type {sinon.SinonStub} Stub for createModel method. */
                let createModelStub: sinon.SinonStub

                /**
                 * @function beforeEach
                 * @description Stubs the createModel method before each test.
                 */
                beforeEach(() => {
                    // 🛠️ Stub the createModel method of ModelManager
                    createModelStub = sinon.stub(ModelManager.prototype, 'createModel')
                        .resolves(modelDetails.Model)
                })

                it('should return an array of globbed models', async() => {
                    // 📦 Destructure modelDetails
                    const { modelName, dbName, schema } = modelDetails
                    const expression = `${process.cwd()}/test/models/**/*.model.mjs`

                    // 🔍 Call globModels with the expression
                    const globbedModels = await modelManager['globModels'](expression)

                    // ==== SPIES ====
                    // 🔍 Verify createModel was called with correct parameters
                    expect(createModelStub.calledOnceWithExactly({
                        modelName, schema, dbName
                    })).toBe(true)

                    // ==== EXPECTS ====
                    // 🔢 Ensure globbedModels contains the expected model
                    expect(globbedModels).toEqual([modelDetails])
                })
    
                it('should return an empty array because no model can be found', async() => {
                    // 🚫 Define a non-existent expression
                    const expression = `${process.cwd()}/**/*.modelNotFound.test.ts`

                    // 🔍 Call globModels with the expression
                    const result = await modelManager['globModels'](expression)

                    // 🔢 Ensure result is an empty array
                    expect(result).toEqual([])
                })
            })

            describe('pushModel()', () => {
                it('should add a new model to the instance models', () => {
                    // ➕ Add modelDetails to models
                    modelManager['pushModel'](modelDetails)

                    // 🔢 Ensure models contain modelDetails
                    expect(modelManager.models).toEqual([modelDetails])
                })

                it('should throw an error if a model with the same name already exists', () => {
                    // 📦 Assign modelDetails to models
                    modelManager.models = [modelDetails]

                    try {
                        // ➕ Attempt to push the same model again
                        modelManager['pushModel'](modelDetails)
                        // 🚫 Fail if no error is thrown
                        assert.fail('This line should not be reached')
                    } catch (err) {
                        // 🛑 Check if the error is a ValidationError
                        if (err instanceof ValidationError) {
                            // 🔍 Verify the error message
                            expect(err.message).toBe(
                                `Model '${modelDetails.modelName}' already exists.`
                            )

                            return
                        }
            
                        // 🚫 Fail if a different error is thrown
                        assert.fail('This line should not be reached')
                    }
                })
            })
        })

        describe('[PUBLIC]', () => {
            describe('getModels()', () => {
                /**
                 * @description Sets models before each test.
                 */
                beforeEach(() => {
                    // 📦 Assign modelDetails to models
                    modelManager.models = [modelDetails]
                })

                it('should return all models', () => {
                    // 🔍 Call getModels
                    const models = modelManager.getModels()

                    // 🔢 Ensure models are returned correctly
                    expect(models).toEqual([modelDetails])
                })
            })

            describe('getModel()', () => {
                describe('[ERROR]', () => {
                    it('should throw error if the model with the specified name is not found', () => {
                        try {
                            // 🔍 Attempt to get a non-existent model
                            modelManager.getModel('not-found')
                            // 🚫 Fail if no error is thrown
                            assert.fail('This line should not be reached')
                        } catch (err) {
                            // 🛑 Check if the error is a ResourceNotFoundError
                            if (err instanceof ResourceNotFoundError) {
                                // 🔍 Verify the error message
                                expect(err.message).toEqual(
                                    '[Model Manager] - Model \'not-found\' not found.'
                                )

                                return
                            }

                            // 🚫 Fail if a different error is thrown
                            assert.fail('This line should not be reached')
                        }
                    })
                })
                describe('[SUCCESS]', () => {
                    it('should return the model with the specified name', () => {
                        // 📦 Assign modelDetails to models
                        modelManager.models = [modelDetails]

                        // 🔍 Call getModel with modelName
                        const result = modelManager.getModel(modelDetails.modelName)

                        // 🔢 Ensure result is the expected model
                        expect(result).toEqual(modelDetails)
                    })
                })
            })

            describe('createModel()', () => {
                /** @type {sinon.SinonStub} Stub for mongooseUtils.getInstance. */
                let mongooseUtilsGetInstanceStub: sinon.SinonStub

                /** @type {sinon.SinonStub} Stub for mongooseUtils.createModel. */
                let mongooseUtilsCreateModelStub: sinon.SinonStub

                /** @type {sinon.SinonStub} Stub for modelDetails.Model.createIndexes. */
                let modelCreateIndexesStub: sinon.SinonStub

                /** @type {sinon.SinonSpy} Spy for pushModel method. */
                let pushModelSpy: sinon.SinonSpy
            
                /**
                 * @function beforeEach
                 * @description Stubs necessary methods before each test.
                 */
                beforeEach(() =>{
                    // 🛠️ Stub the createModel method to return modelDetails.Model
                    mongooseUtilsCreateModelStub = sinon.stub().resolves(modelDetails.Model)

                    // 🏗️ Stub the getInstance method of MongooseUtils
                    mongooseUtilsGetInstanceStub = sinon.stub(MongooseUtils, 'getInstance').returns({
                        createModel: mongooseUtilsCreateModelStub
                    } as unknown as MongooseUtils)
                    
                    // 🏗️ Stub createIndexes method to resolve
                    modelCreateIndexesStub = sinon.stub(modelDetails.Model, 'createIndexes').resolves()

                    // 🥅 Spy on pushModel method
                    pushModelSpy = sinon.spy(ModelManager.prototype, 'pushModel' as keyof ModelManager)
                })
            
                it('should create a new mongoose model and call createIndexes()', async() => {
                    // 📦 Destructure modelDetails
                    const { modelName, schema, dbName, Model } = modelDetails

                    // 🔍 Call createModel method
                    const createdModel = await modelManager.createModel<IMongooseSchema>({
                        modelName, schema, dbName
                    })
            
                    // ==== SPIES ====
                    // 🔍 Verify getInstance was called with dbName
                    expect(
                        mongooseUtilsGetInstanceStub.calledOnceWithExactly(dbName)
                    ).toBe(true)

                    // 🔍 Verify createModel was called with schema and modelName
                    expect(
                        mongooseUtilsCreateModelStub.calledOnceWithExactly(schema, modelName)
                    ).toBe(true)

                    // 🔍 Verify createIndexes was called once
                    expect(modelCreateIndexesStub.calledOnce).toBe(true)

                    // 🔍 Verify pushModel was called with modelDetails
                    expect(pushModelSpy.calledOnceWithExactly(modelDetails)).toBe(true)
            
                    // ==== EXPECTS ====
                    // 🔢 Ensure createdModel matches expected Model
                    expect(createdModel).toEqual(Model)

                    // 🔢 Ensure modelManager contains the new model
                    expect(
                        modelManager.models.find(model => model.modelName === modelName)
                    ).toEqual(modelDetails)
                })
            })
        })
    })
})
