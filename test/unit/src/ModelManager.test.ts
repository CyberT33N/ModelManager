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
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// ==== DEPENDENCIES ====
import sinon from 'sinon'
import mongoose, {
    type SchemaDefinition
} from 'mongoose'

// ==== CODE ====
import ModelManager, {
    type GenerateMongooseSchemaType,
    type ModelInterface
} from '@/src/ModelManager'

// ==== CLASSES ====
import MongooseUtils from '@/src/MongooseUtils'

describe('ModelManager', () => {
    const schema = {
        name: { type: String, required: true },
        email: { type: String, required: true },
        avatar: String
    }

    interface IUser {
        name: string
        email: string
        avatar: string
    }

    const userSchema = new mongoose.Schema<IUser>(schema)
    const UserModel = mongoose.model<IUser>('User', userSchema)

    const modelDetails = {
        modelName: 'Model1',
        Model: UserModel,
        dbName: 'test',
        schema
    }

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

                it.only('should not initialize models if already initialized', async() => {
                    const expectedModels = [modelDetails]

                    modelManager.models = expectedModels
                    await Object.getPrototypeOf(modelManager).init()

                    expect(globModelsStub.calledOnce).toBe(false)
                    expect(modelManager.models).toEqual(expectedModels)
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
                    const result = await Object.getPrototypeOf(modelManager).globModels(expression)
                    
                    const modelDetails = await import('@/test/models/Test.model.mjs')
                    const { modelName, dbName, schema } = modelDetails
    
                    expect(result[0].modelName).toBe(modelName)
                    expect(result[0].Model).toBeTruthy()
                    expect(result[0].dbName).toBe(dbName)
                    expect(result[0].schema).toBeTruthy()
                    expect(createModelSpy.calledOnceWithExactly({
                        modelName, schema, dbName
                    })).toBe(true)
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
