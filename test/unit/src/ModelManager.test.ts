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
import mongoose, {
    type SchemaDefinition
} from 'mongoose'

// ==== CODE ====
import ModelManager, {
    type IModel, type IModelCore
} from '@/src/ModelManager'

// ==== CLASSES ====
import MongooseUtils from '@/src/MongooseUtils'

describe('ModelManager',() => {
    let modelDetails: IModel<any> 

    beforeAll(async () => {
        const modelDetail: IModelCore<any> = await import('@/test/models/Test.model.mjs')
        const { modelName, dbName, schema } = modelDetail
    
        // Generate the Mongoose schema type
        type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>
    
        const mongooseSchema = new mongoose.Schema<TMongooseSchema>(schema)
        const Model = mongoose.model<TMongooseSchema>(modelName, mongooseSchema)
    
        modelDetails = {
            modelName,
            Model,
            dbName,
            schema
        } as IModel<TMongooseSchema>
    })

    describe('getInstance()', () => {
        let initStub: sinon.SinonStub

        beforeEach(() => {
            initStub = sinon.stub(
                ModelManager.prototype, 'init' as keyof ModelManager
            ).resolves()
        })

        afterEach(() => {
            initStub.restore()
        })

        it('should create new instance', async() => {
            const modelManager = await ModelManager.getInstance()

            expect(initStub.calledOnce).toBe(true)
            expect(modelManager.models).toEqual([])
        })

        it('should return existing instance', async() => {
            const modelManager = await ModelManager.getInstance()

            expect(initStub.calledOnce).toBe(true)
            expect(modelManager.models).toEqual([])

            const modelManager2 = await ModelManager.getInstance()
            expect(initStub.calledOnce).toBe(true)
            expect(modelManager2.models).toEqual([])
        })
    })

    describe('[METHODS]', () => {
        let modelManager: ModelManager

        beforeEach(async() => {
            modelManager = await ModelManager.getInstance()
        })

        describe('[PRIVATE]', () => {
            describe('init()', () => {
                let globModelsStub: sinon.SinonStub

                beforeEach(() => {
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
                let createModelSpy: sinon.SinonSpy

                beforeEach(() => {
                    createModelSpy = sinon.spy(ModelManager.prototype, 'createModel')
                })

                afterEach(() => {
                    createModelSpy.restore()
                })
            
                it('should return an array of globbed models', async() => {
                    const expression = `${process.cwd()}/test/models/**/*.model.mjs`
                    const globbedModels = await Object.getPrototypeOf(modelManager).globModels(expression)
                    const globbedModel = globbedModels.at(0)

                    const { modelName, dbName, schema } = modelDetails
                    
                    // ==== SPIES ====
                    expect(createModelSpy.calledOnceWithExactly({
                        modelName, schema, dbName
                    })).toBe(true)

                    // ==== EXPECTS ====
                    expect(globbedModel.modelName).toBe(modelName)
                    expect(globbedModel.dbName).toBe(dbName)
                    expect(globbedModel.schema).toEqual(schema)

                    expect(globbedModel.Model.modelName).toBe(modelName)
                    expect(globbedModel.Model.db.name).toBe(dbName)

                    const modelInstance = new globbedModel.Model()
                    expect(modelInstance).toBeInstanceOf(mongoose.Model)
                })
    
                it('should return an empty array because no model can be found', async() => {
                    const expression = `${process.cwd()}/**/*.modelNotFound.test.ts`
                    const result = await Object.getPrototypeOf(modelManager).globModels(expression)
                    expect(result).toEqual([])
                })
            })
        })

        describe('[PUBLIC]', () => {
            describe('createModel()', () => {
                let modelManager: ModelManager
                let mongooseUtilsGetInstanceStub: sinon.SinonStub
                let mongooseUtilsCreateModelStub: sinon.SinonStub
                let modelCreateIndexesStub: sinon.SinonStub
            
                beforeEach(async() => {
                    // const mongooseUtils = await MongooseUtils.getInstance('test')
                    modelManager = await ModelManager.getInstance()
            
                    mongooseUtilsCreateModelStub = sinon.stub().returns(UserModel)

                    mongooseUtilsGetInstanceStub = sinon.stub(MongooseUtils, 'getInstance').resolves({
                        createModel: mongooseUtilsCreateModelStub
                    })
                    
                    modelCreateIndexesStub = sinon.stub(UserModel, 'createIndexes').resolves()
                })
            
                afterEach(() => {
                    mongooseUtilsGetInstanceStub.restore()
                    modelCreateIndexesStub.restore()
                })
            
                it('should create a new model and call createIndexes', async() => {
                    const name = 'TestModel'
                    const schema = new mongoose.Schema({ name: String })
                    const dbName = 'test'
            
                    const result = await modelManager.createModel(name, schema, dbName)
            
                    expect(mongooseUtilsGetInstanceStub.calledOnce).toBe(true)
                    expect(mongooseUtilsGetInstanceStub.calledWith(dbName)).toBe(true)
            
                    expect(mongooseUtilsCreateModelStub.calledOnce).toBe(true)
                    expect(mongooseUtilsCreateModelStub.calledWith(schema, name)).toBe(true)
            
                    expect(modelCreateIndexesStub.calledOnce).toBe(true)
            
                    expect(result.modelName).toBe(UserModel.modelName)
                })
            })

            describe('getModels()', () => {
                it('should return all models', async() => {
                    const models = [
                        {
                            modelName: 'Model1',
                            Model: UserModel,
                            dbName: 'test',
                            schema: userSchema
                        },
                        { 
                            modelName: 'Model2',
                            Model: UserModel,
                            dbName: 'test',
                            schema: userSchema
                        }
                    ]

                    modelManager.models = models

                    const result = await modelManager.getModels()
                    expect(result).toEqual(models)
                })
            })

            describe('getModel()', () => {
                it('should return the model with the specified name', async() => {
                    const model1 = {
                        modelName: 'Model1',
                        Model: UserModel,
                        dbName: 'test',
                        schema: userSchema
                    }

                    const model2 = { 
                        modelName: 'Model2',
                        Model: UserModel,
                        dbName: 'test',
                        schema: userSchema
                    }

                    const models = [model1, model2]

                    modelManager.models = models

                    const result = modelManager.getModel(model2.modelName)
                    expect(result).toEqual(model2)
                })

                it('should return undefined if the model with the specified name does not exist', async() => {
                    const result = modelManager.getModel('Model3')
                    expect(result).toBeUndefined()
                })
            })
        })
    })
})
