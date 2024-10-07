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
import mongoose from 'mongoose'
import sinon from 'sinon'
import { MongoMemoryServer } from 'mongodb-memory-server'

import {
    describe, it, assert,
    expect, expectTypeOf,
    beforeEach, afterEach, beforeAll, afterAll
} from 'vitest'

import {
    BaseError,
    type IBaseError
} from 'error-manager-helper'

// ==== INTERNAL ====
import type { IModel, IModelCore } from '@/src/ModelManager'
import ModelUtils from '@/src/ModelUtils'

// ==== CODE TO TEST ====
import MongooseUtils from '@/src/MongooseUtils'

describe('[UNIT TEST] - src/MongooseUtils.ts', () => {
    let mongooseUtils: MongooseUtils

    let modelDetails: IModel<any>
    let mongooseSchema: mongoose.Schema<any>

    let conn: mongoose.Connection
    let mongoServer: MongoMemoryServer
    let mongoUri: string

    const docData = { name: 'test', decimals: 69n }

    beforeAll(async () => {
        const modelCoreDetails: IModelCore<any> = await import('@/test/models/Test.model.mjs')
        const { modelName, dbName, schema } = modelCoreDetails
        
        // Generate the Mongoose schema type
        type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>
        ;mongooseSchema = new mongoose.Schema<TMongooseSchema>(schema)
       
        const memoryServerData = await ModelUtils.createMemoryModel(modelCoreDetails)
        mongoServer = memoryServerData.mongoServer
        conn = memoryServerData.conn
        mongoUri = mongoServer.getUri()

        modelDetails = {
            modelName,
            Model: memoryServerData.Model,
            dbName,
            schema
        } as IModel<TMongooseSchema>
    })

    afterAll(async () => {
        // Calling stop() will close all connections from each created instance
        await mongoServer.stop()
    })

    beforeEach(() => {
        Reflect.set(MongooseUtils, 'instances', new Map())
  
        mongooseUtils = MongooseUtils.getInstance(modelDetails.dbName)
        expect(mongooseUtils).toBeInstanceOf(MongooseUtils)
    })

    describe('getInstance()', () => {
        describe('[EXISTING INSTANCE]', () => {
            beforeEach(() => {
                Reflect.set(mongooseUtils, 'changed', true)
            })
             
            it('should get existing instance for db', async() => {
                const mongooseUtils2 = MongooseUtils.getInstance(modelDetails.dbName)
                expect(mongooseUtils2).toEqual(mongooseUtils)

                expect(Reflect.get(MongooseUtils, 'instances').size).toBe(1)
                
                expect(Reflect.get(mongooseUtils2, 'changed')).toBe(true)
                expect(Reflect.get(mongooseUtils2, 'dbName')).toBe(modelDetails.dbName)
            })
        })

        describe('[NEW INSTANCE]', () => {
            const dbName2 = 'test2'

            it('should create new instance and set default properties', async() => {
                expect(Reflect.get(mongooseUtils, 'dbName')).toBe(modelDetails.dbName)
                expect(Reflect.get(mongooseUtils, 'conn')).toBe(null)
                expect(Reflect.get(mongooseUtils, 'connectionString'))
                .toBe(process.env.MONGODB_CONNECTION_STRING)
            })

            it('should create new instance if instance for db not exists', async() => {
                // ==== INSTANCE #1 ====
                expect(Reflect.get(MongooseUtils, 'instances').size).toBe(1)

                // ==== INSTANCE #2 ====
                const mongooseUtils2 = MongooseUtils.getInstance(dbName2)
                expect(mongooseUtils2).toBeInstanceOf(MongooseUtils)
                expect(mongooseUtils2).not.toEqual(mongooseUtils)

                expect(Reflect.get(MongooseUtils, 'instances').size).toBe(2)
            })
        })
    })

    describe('[METHODS]', () => {
        describe('[STATIC]', () => {
            describe('createSchema', () => {
                let schemaSpy: sinon.SinonSpy

                beforeEach(async() => {
                    schemaSpy = sinon.spy(mongoose, 'Schema')
                })
       
                afterEach(() => {
                    schemaSpy.restore()
                })

                it('should create a mongoose schema', () => {
                    const { modelName, schema } = modelDetails

                    // Generate the Mongoose schema type
                    type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>
                
                    const mongooseSchema = MongooseUtils.createSchema<TMongooseSchema>(schema, modelName)
                    expect(mongooseSchema).toBeInstanceOf(mongoose.Schema)
                    expect(schemaSpy.calledOnceWithExactly(schema, { collection: modelName })).toBe(true)
                })
            })
        })

        describe('[PRIVATE]', () => {
            describe('init()', () => {
                let updateConnectionStringStub: sinon.SinonStub
 
                beforeEach(() => {
                    updateConnectionStringStub = sinon.stub(
                        MongooseUtils.prototype, 'updateConnectionString' as keyof MongooseUtils
                    ).resolves()
                })

                afterEach(() => {
                    updateConnectionStringStub.restore()
                })

                describe('[ERROR]', () => {
                    let createConnectionStub: sinon.SinonStub

                    const expectedErrorMessage = 'Connection error'

                    beforeEach(() => {
                        const error = new Error(expectedErrorMessage)

                        createConnectionStub = sinon.stub(mongoose, 'createConnection').returns({
                            asPromise: () => Promise.reject(error)
                        } as unknown as mongoose.Connection)
                    })

                    afterEach(() => {
                        createConnectionStub.restore()
                    })

                    it('should throw an error when initializing connection with mongoose fails', async () => {
                        try {
                            await Object.getPrototypeOf(mongooseUtils).init()
                            assert.fail('This line should not be reached')
                        } catch (err) {
                            if (err instanceof BaseError) {
                                const typedErr: IBaseError = err 
                                expectTypeOf(typedErr).toEqualTypeOf<IBaseError>()

                                expect(typedErr.error?.message).toBe(expectedErrorMessage)
                                expect(typedErr.message).toBe(
                                    '[ModelManager] - Error while initializing connection with MongoDB'
                                )

                                return
                            }

                            assert.fail('This line should not be reached')
                        }
                    })
                })

                describe('[SUCCESS]', () => {
                    let createConnectionSpy: sinon.SinonSpy

                    beforeEach(() => {
                        createConnectionSpy = sinon.spy(mongoose, 'createConnection')
                        Reflect.set(mongooseUtils, 'connectionString', mongoUri)
                    })

                    afterEach(async () => {
                        createConnectionSpy.restore()
                    })

                    it('should initialize connection with mongoose', async () => {
                        const initMethod: Function = Reflect.get(mongooseUtils, 'init')
                        await initMethod.call(mongooseUtils)

                        // ==== STUBS ====
                        expect(updateConnectionStringStub.calledOnce).toBeTruthy()
                        expect(createConnectionSpy.calledOnceWithExactly(mongoUri)).toBe(true)

                        // ==== CONNECTION ====
                        const conn: mongoose.Connection = Reflect.get(mongooseUtils, 'conn')
                        expect(conn.readyState).toBe(1)
                        expect(conn).toBeInstanceOf(mongoose.Connection)

                        const { modelName, schema } = modelDetails
                        
                        // Create a model using the connection
                        type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>
                        const Model = conn.model<TMongooseSchema>(modelName, mongooseSchema, modelName)

                        // Test if the created connection model is working
                        const doc = new Model(docData)
                        await doc.save()

                        const foundDoc = await Model.findOne(docData)
                        expect(foundDoc).toEqual(expect.objectContaining(docData))
                    })
                })
            })

            describe('updateConnectionString()', () => {
                const dbName = 'newDbName'

                beforeEach(() => {
                    Reflect.set(mongooseUtils, 'dbName', dbName)
                })

                it('should update the connection string with the correct database name', () => {
                    const method: Function = Reflect.get(mongooseUtils, 'updateConnectionString')
                    method.call(mongooseUtils)

                    const newConnectionString = Reflect.get(mongooseUtils, 'connectionString')

                    const urlObj = new URL(newConnectionString)

                    expect(urlObj.pathname).toBe(`/${dbName}`)
                    expect(urlObj.toString()).toBe(newConnectionString)
                })
            })
        })

        describe('[PUBLIC]', () => {
            describe('getConnection()', () => {
                let initStub: sinon.SinonStub

                beforeEach(() => {
                    initStub = sinon.stub(
                        MongooseUtils.prototype, 'init' as keyof MongooseUtils
                    ).resolves()
                })

                afterEach(() => {
                    initStub.restore()
                })
       
                describe('[NEW CONNECTION]', () => {
                    it('should call init method because conn is null', async() => {
                        const conn = await mongooseUtils.getConnection()
                        expect(conn).toBe(null)
                        expect(initStub.calledOnce).toBe(true)
                    })
                })

                describe('[EXISTING CONNECTION]', () => {
                    it('should not call init method because conn not null', async() => {
                        const expectedConn = {} as mongoose.Connection
                        Reflect.set(mongooseUtils, 'conn', expectedConn)

                        const conn = await mongooseUtils.getConnection()
                        expect(initStub.called).toBe(false)
                        expect(conn).toEqual(expectedConn)
                    })
                })
            })

            describe('createModel()', () => {
                let createSchemaStub: sinon.SinonStub
                let getConnectionStub: sinon.SinonStub

                beforeEach(() => {
                    createSchemaStub = sinon.stub(
                        MongooseUtils, 'createSchema'
                    ).returns(mongooseSchema)
                        
                    getConnectionStub = sinon.stub(
                        MongooseUtils.prototype, 'getConnection' as keyof MongooseUtils
                    ).resolves(Promise.resolve(conn))
                })
      
                afterEach(() => {
                    createSchemaStub.restore()
                    getConnectionStub.restore()
                })
               
                it('should create a mongoose model', async() => {
                    const { modelName, schema } = modelDetails
                    
                    type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>
                    const Model = await mongooseUtils.createModel<TMongooseSchema>(schema, modelName)

                    // ==== SPIES ====
                    expect(createSchemaStub.calledOnceWithExactly(schema, modelName)).toBe(true)
                    expect(getConnectionStub.calledOnce).toBeTruthy()

                    // ==== MODEL ====
                    expect(Model.modelName).toBe(modelName)

                    // Test if the created connection model is working
                    const doc = new Model(docData)
                    await doc.save()

                    const foundDoc = await Model.findOne(docData)
                    expect(foundDoc).toEqual(expect.objectContaining(docData))
                })
            })
        })
    })
})