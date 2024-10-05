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

// ==== VITEST ====
import {
    describe, it, expect, beforeEach, afterEach, beforeAll
} from 'vitest'

// ==== DEPENDENCIES ====
import sinon from 'sinon'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

// ==== CODE ====
import ModelManager, {
    type IModel, type IModelCore
} from '@/src/ModelManager'

// ==== CLASSES ====
import MongooseUtils from '@/src/MongooseUtils'

describe('[UNIT TEST] - src/ModelManager.ts',() => {
    let modelDetails: IModel<any> 
    let modelManager: ModelManager
    let initStub: sinon.SinonStub

    beforeAll(async () => {
        const modelDetail: IModelCore<any> = await import('@/test/models/Test.model.mjs')
        const { modelName, dbName, schema } = modelDetail
    
        // Generate the Mongoose schema type
        type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>
    
        const mongooseSchema = new mongoose.Schema<TMongooseSchema>(schema)
       
        const mongoServer: MongoMemoryServer = await MongoMemoryServer.create({
            instance: { dbName }
        })

        const conn = await mongoose.createConnection(mongoServer.getUri(), { dbName }).asPromise()
        const Model = conn.model<TMongooseSchema>(modelName, mongooseSchema, modelName)
    
        modelDetails = {
            modelName,
            Model,
            dbName,
            schema
        } as IModel<TMongooseSchema>
    })

    beforeEach(async() => {
        // Reset instance before creating a new one
        (<any>ModelManager).instance = null

        initStub = sinon.stub(
            ModelManager.prototype, 'init' as keyof ModelManager
        ).resolves()

        modelManager = await ModelManager.getInstance()
    })

    afterEach(() => {
        initStub.restore()
    })

    describe('getInstance()', () => {
        it('should create new instance', async() => {
            expect(initStub.calledOnce).toBe(true)
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

                    // Reset models because of beforeEach above
                    modelManager.models = []
                })

                afterEach(() => {
                    globModelsStub.restore()
                })
            
                it('should initialize models if not already initialized', async() => {
                    await Object.getPrototypeOf(modelManager).init()

                    expect(globModelsStub.calledOnce).toBe(true)
                    expect(globModelsStub.calledWith(`${process.cwd()}/**/*.model.mjs`)).toBe(true)
                    expect(modelManager.models).toEqual([])
                })

                it('should not initialize models if already initialized', async() => {
                    modelManager.models = [modelDetails]

                    const initMethod: Function = Reflect.get(modelManager, 'init')
                    await initMethod.call(modelManager)
                    
                    expect(globModelsStub.called).toBe(false)
                    expect(modelManager.models).toEqual([modelDetails])
                })
            })

            describe('globModels', () => {
                let createModelStub: sinon.SinonSpy

                beforeEach(() => {
                    createModelStub = sinon.stub(ModelManager.prototype, 'createModel')
                        .resolves(modelDetails.Model)
                })

                afterEach(() => {
                    createModelStub.restore()
                })
            
                it('should return an array of globbed models', async() => {
                    const expression = `${process.cwd()}/test/models/**/*.model.mjs`
                    const globbedModels = await Object.getPrototypeOf(modelManager)
                        .globModels(expression)

                    const globbedModel = globbedModels.at(0)

                    const { modelName, dbName, schema, Model } = modelDetails
                    
                    // ==== SPIES ====
                    expect(createModelStub.calledOnceWithExactly({
                        modelName, schema, dbName
                    })).toBe(true)

                    // ==== EXPECTS ====
                    expect(globbedModel.modelName).toBe(modelName)
                    expect(globbedModel.dbName).toBe(dbName)
                    expect(globbedModel.schema).toEqual(schema)
                    expect(globbedModel.Model).toEqual(Model)
                })
    
                it('should return an empty array because no model can be found', async() => {
                    const expression = `${process.cwd()}/**/*.modelNotFound.test.ts`
                    const result = await Object.getPrototypeOf(modelManager).globModels(expression)
                    expect(result).toEqual([])
                })
            })
        })

        describe('[PUBLIC]', () => {
            describe('getModels()', () => {
                it('should return all models', async() => {
                    modelManager.models = [modelDetails]

                    const models = await modelManager.getModels()
                    expect(models).toEqual([modelDetails])
                })
            })

            describe('getModel()', () => {
                it('should return the model with the specified name', async() => {
                    modelManager.models = [modelDetails]

                    const result = modelManager.getModel(modelDetails.modelName)
                    expect(result).toEqual(modelDetails)
                })

                it('should return undefined if the model with the specified name does not exist', async() => {
                    const result = modelManager.getModel('NotFound')
                    expect(result).toBeUndefined()
                })
            })

            describe('createModel()', () => {
                let modelManager: ModelManager
                let mongooseUtilsGetInstanceStub: sinon.SinonStub
                let mongooseUtilsCreateModelStub: sinon.SinonStub
                let modelCreateIndexesStub: sinon.SinonStub
            
                beforeEach(async() => {
                    // const mongooseUtils = await MongooseUtils.getInstance('test')
                    modelManager = await ModelManager.getInstance()
            
                    mongooseUtilsCreateModelStub = sinon.stub().returns(modelDetails.Model)

                    mongooseUtilsGetInstanceStub = sinon.stub(MongooseUtils, 'getInstance').resolves({
                        createModel: mongooseUtilsCreateModelStub
                    })
                    
                    modelCreateIndexesStub = sinon.stub(modelDetails.Model, 'createIndexes').resolves()
                })
            
                afterEach(() => {
                    mongooseUtilsGetInstanceStub.restore()
                    modelCreateIndexesStub.restore()
                })
            
                it('should create a new model and call createIndexes', async() => {
                    const { modelName, schema, dbName, Model } = modelDetails

                    type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>
                    const createdModel = await modelManager.createModel<TMongooseSchema>({ modelName, schema, dbName })
            
                    // ==== SPIES ====
                    expect(mongooseUtilsGetInstanceStub.calledOnceWithExactly(dbName)).toBe(true)
                    expect(mongooseUtilsCreateModelStub.calledOnceWithExactly(schema, modelName)).toBe(true)
                    expect(modelCreateIndexesStub.calledOnce).toBe(true)
            
                    // ==== EXPECTS ====
                    expect(createdModel).toEqual(Model)
                })
            })
        })
    })
})
