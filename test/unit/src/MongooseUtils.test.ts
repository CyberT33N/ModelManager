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

import {
    describe, it, assert,
    expect, expectTypeOf,
    beforeEach, afterEach, beforeAll
} from 'vitest'

import {
    BaseError,
    type IBaseError
} from 'error-manager-helper'

// ==== INTERNAL ====
import type { IModel } from '@/src/ModelManager'
import type { IMemoryModel } from '@/src/ModelUtils'

// ==== CODE TO TEST ====
import MongooseUtils from '@/src/MongooseUtils'

describe('[UNIT TEST] - src/MongooseUtils.ts', () => {
    let mongooseUtils: MongooseUtils
    let modelDetails: IModel<any>
    let memoryModelDetails: IMemoryModel<any>
    let docData: Record<string, any>

    beforeAll(() => {
        modelDetails = globalThis.modelDetails
        memoryModelDetails = globalThis.memoryModelDetails
        docData = globalThis.docData
    })

    beforeEach(() => {
        // Reset the instances map
        MongooseUtils['instances'] = new Map()

        mongooseUtils = MongooseUtils.getInstance(modelDetails.dbName)
        expect(mongooseUtils).toBeInstanceOf(MongooseUtils)
    })

    describe('getInstance()', () => {
        describe('[EXISTING INSTANCE]', () => {
            it('should get existing instance for db', () => {
                const mongooseUtils2 = MongooseUtils.getInstance(modelDetails.dbName)
                expect(mongooseUtils2).toEqual(mongooseUtils)
                expect(MongooseUtils['instances'].size).toBe(1)
                expect(mongooseUtils2['dbName']).toBe(modelDetails.dbName)
            })
        })

        describe('[NEW INSTANCE]', () => {
            const dbName2 = 'test2'

            it('should create new instance and set default properties', () => {
                // Instance will be created in beforeEach
                expect(mongooseUtils['dbName']).toBe(modelDetails.dbName)
                expect(mongooseUtils['conn']).toBe(null)
                expect(mongooseUtils['connectionString']).toBe(process.env.MONGODB_CONNECTION_STRING)
            })

            it('should create new instance if instance for db not exists', () => {
                // Instance will be created in beforeEach
                // ==== INSTANCE #1 ====
                expect(MongooseUtils['instances'].size).toBe(1)

                // ==== INSTANCE #2 ====
                const mongooseUtils2 = MongooseUtils.getInstance(dbName2)
                expect(mongooseUtils2).toBeInstanceOf(MongooseUtils)
                expect(mongooseUtils2).not.toEqual(mongooseUtils)

                expect(MongooseUtils['instances'].size).toBe(2)
            })
        })
    })

    describe('[METHODS]', () => {
        describe('[STATIC]', () => {
            describe('createSchema()', () => {
                let schemaSpy: sinon.SinonSpy

                beforeEach(() => {
                    schemaSpy = sinon.spy(mongoose, 'Schema')
                })
       
                afterEach(() => {
                    schemaSpy.restore()
                })

                it('should create a mongoose schema', () => {
                    const { modelName, schema } = modelDetails

                    // Generate the Mongoose schema type
                    type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>
                
                    const mongooseSchema = MongooseUtils.createSchema<TMongooseSchema>(schema, {
                        collection: modelName
                    })

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

                    it('should throw an error when initializing connection with mongoose fails', async() => {
                        try {
                            await mongooseUtils['init']()
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
                        mongooseUtils['connectionString'] = memoryModelDetails.mongoUri
                    })

                    afterEach(() => {
                        createConnectionSpy.restore()
                    })

                    it('should initialize connection with mongoose', async() => {
                        await mongooseUtils['init']()

                        // ==== STUBS ====
                        expect(updateConnectionStringStub.calledOnce).toBeTruthy()
                        expect(createConnectionSpy.calledOnceWithExactly(memoryModelDetails.mongoUri)).toBe(true)

                        // ==== CONNECTION ====
                        const conn = mongooseUtils['conn']!
                        expect(conn.readyState).toBe(1)
                        expect(conn).toBeInstanceOf(mongoose.Connection)

                        const { modelName, schema } = modelDetails
                        
                        // Create a model using the connection
                        type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>
                        const mongooseSchema = new mongoose.Schema<TMongooseSchema>(schema)

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
                    // Must sue reflect here because of read-only property
                    Reflect.set(mongooseUtils, 'dbName', dbName)
                })

                it('should update the connection string with the correct database name', () => {
                    mongooseUtils['updateConnectionString']()

                    const newConnectionString = mongooseUtils['connectionString']
                    
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
                        mongooseUtils['conn'] = expectedConn

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
                    ).returns(global.mongooseSchema as mongoose.Schema<unknown>)
                        
                    getConnectionStub = sinon.stub(
                        MongooseUtils.prototype, 'getConnection' as keyof MongooseUtils
                    ).resolves(memoryModelDetails.conn)
                })
      
                afterEach(() => {
                    createSchemaStub.restore()
                    getConnectionStub.restore()
                })

                describe('[ERROR]', () => {
                    it('should validate schema and should not allow to create doc', async() => {
                        const { modelName, schema } = modelDetails
                    
                        type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>
                        const Model = await mongooseUtils.createModel<TMongooseSchema>(schema, modelName)

                        // Should throw an error when trying to create a document
                        try {
                            const doc = new Model({ notValid: true })
                            await doc.save()

                            assert.fail('This line should not be reached')
                        } catch (err) {
                            if (err instanceof mongoose.Error.ValidationError) {
                                expect(err.errors.name.message).toEqual('Path `name` is required.')
                                expect(err.errors.decimals.message).toEqual('Path `decimals` is required.')
                                return
                            }

                            assert.fail('This line should not be reached')
                        }
                    })
                })

                describe('[SUCCESS]', () => {
                    it('should create a mongoose model', async() => {
                        const { modelName, schema } = modelDetails
                    
                        type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>
                        const Model = await mongooseUtils.createModel<TMongooseSchema>(schema, modelName)

                        // ==== SPIES ====
                        expect(createSchemaStub.calledOnceWithExactly(
                            schema, { collection: modelName })
                        ).toBe(true)
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
})