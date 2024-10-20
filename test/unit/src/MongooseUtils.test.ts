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

// 🌍 ==== DEPENDENCIES ====
import mongoose from 'mongoose'
import sinon from 'sinon'

import {
    describe, it, assert,
    expect, expectTypeOf,
    beforeEach, beforeAll
} from 'vitest'

import {
    BaseError,
    type IBaseError
} from 'error-manager-helper'

// 🧩 ==== INTERNAL ====
import type { IModel } from '@/src/ModelManager'
import type { IMemoryModel } from '@/src/ModelUtils'

// 🔌 ==== CODE TO TEST ====
import MongooseUtils from '@/src/MongooseUtils'
import type { IMongooseSchema } from '@/test/models/Test.model.ts'

/**
 * Unit tests for the MongooseUtils class.
 */
describe('[UNIT TEST] - src/MongooseUtils.ts', () => {
    /** 
     * Instance of MongooseUtils for testing. 
     */
    let mongooseUtils: MongooseUtils

    /** 
     * Model details used for database interaction.
     */
    let modelDetails: IModel<any>

    /** 
     * Memory model details for in-memory database testing.
     */
    let memoryModelDetails: IMemoryModel<any>

    /** 
     * Data for document creation in tests.
     */
    let docData: Record<string, any>

    /** 
     * Initialize test environment before all tests.
     */
    beforeAll(() => {
        modelDetails = globalThis.modelDetails
        memoryModelDetails = globalThis.memoryModelDetails
        docData = globalThis.docData
    })

    /** 
     * Reset MongooseUtils instance before each test.
     */
    beforeEach(() => {
        // 🔄 Reset the instances map
        MongooseUtils['instances'] = new Map()

        // Get MongooseUtils instance for testing
        mongooseUtils = MongooseUtils.getInstance(modelDetails.dbName)
        expect(mongooseUtils).toBeInstanceOf(MongooseUtils)
    })

    // 🌟  === TESTING getInstance() ===
    describe('getInstance()', () => {
        // 🔁 === EXISTING INSTANCE ===
        describe('[EXISTING INSTANCE]', () => {
            it('should get existing instance for db', () => {
                // Get existing MongooseUtils instance
                const mongooseUtils2 = MongooseUtils.getInstance(modelDetails.dbName)
                
                // Ensure instances are the same
                expect(mongooseUtils2).toEqual(mongooseUtils)
                expect(MongooseUtils['instances'].size).toBe(1)
                expect(mongooseUtils2['dbName']).toBe(modelDetails.dbName)
            })
        })

        // ➕ === NEW INSTANCE ===
        describe('[NEW INSTANCE]', () => {
            const dbName2 = 'test2'

            it('should create new instance and set default properties', () => {
                // Check default properties of newly created instance
                expect(mongooseUtils['dbName']).toBe(modelDetails.dbName)
                expect(mongooseUtils['conn']).toBe(null)
                expect(mongooseUtils['connectionString']).toBe(process.env.MONGODB_CONNECTION_STRING)
            })

            it('should create new instance if instance for db not exists', () => {
                // Check for first instance
                expect(MongooseUtils['instances'].size).toBe(1)

                // Check for second instance creation
                const mongooseUtils2 = MongooseUtils.getInstance(dbName2)
                expect(mongooseUtils2).toBeInstanceOf(MongooseUtils)
                expect(mongooseUtils2).not.toEqual(mongooseUtils)

                // Ensure two instances exist
                expect(MongooseUtils['instances'].size).toBe(2)
            })
        })
    })

    // 📚 === TESTING METHODS ===
    describe('[METHODS]', () => {
        // ⚙️ === STATIC METHODS ===
        describe('[STATIC]', () => {
            // 🛠️ createSchema() TEST
            describe('createSchema()', () => {
                /** 
                 * Spy for mongoose.Schema during tests.
                 */
                let schemaSpy: sinon.SinonSpy

                /** 
                 * Setup before each test to spy on mongoose.Schema.
                 */
                beforeEach(() => {
                    schemaSpy = sinon.spy(mongoose, 'Schema')
                })

                it('should create a mongoose schema', () => {
                    const { modelName, schema } = modelDetails

                    // Create mongoose schema using utility method
                    const mongooseSchema = MongooseUtils.createSchema<IMongooseSchema>(schema, {
                        collection: modelName
                    })

                    expect(mongooseSchema).toBeInstanceOf(mongoose.Schema)
                    expect(schemaSpy.calledOnceWithExactly(schema, { collection: modelName })).toBe(true)
                })
            })
        })

        // 🔒 === PRIVATE METHODS ===
        describe('[PRIVATE]', () => {
            // 🏗️ init() TEST
            describe('init()', () => {
                /** 
                 * Stub for the updateConnectionString method.
                 */
                let updateConnectionStringStub: sinon.SinonStub

                /** 
                 * Setup before each test to stub updateConnectionString.
                 */
                beforeEach(() => {
                    updateConnectionStringStub = sinon.stub(
                        MongooseUtils.prototype, 'updateConnectionString' as keyof MongooseUtils
                    ).resolves()
                })

                // ❌ === ERROR HANDLING ===
                describe('[ERROR]', () => {
                    const expectedErrorMessage = 'Connection error'

                    /** 
                     * Setup error condition before each test.
                     */
                    beforeEach(() => {
                        const error = new Error(expectedErrorMessage)

                        sinon.stub(mongoose, 'createConnection').returns({
                            asPromise: () => Promise.reject(error)
                        } as unknown as mongoose.Connection)
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

                // ✅ === SUCCESS HANDLING ===
                describe('[SUCCESS]', () => {
                    /** 
                     * Spy for createConnection during tests.
                     */
                    let createConnectionSpy: sinon.SinonSpy

                    /** 
                     * Setup before each test to spy on createConnection.
                     */
                    beforeEach(() => {
                        createConnectionSpy = sinon.spy(mongoose, 'createConnection')
                        mongooseUtils['connectionString'] = memoryModelDetails.mongoUri
                    })

                    it('should initialize connection with mongoose', async() => {
                        await mongooseUtils['init']()

                        // 🛠️ === STUBS ====
                        expect(updateConnectionStringStub.calledOnce).toBeTruthy()
                        expect(createConnectionSpy.calledOnceWithExactly(memoryModelDetails.mongoUri)).toBe(true)

                        // 🔗 === CONNECTION ====
                        const conn = mongooseUtils['conn']!
                        expect(conn.readyState).toBe(1)
                        expect(conn).toBeInstanceOf(mongoose.Connection)

                        const { modelName, schema } = modelDetails
                        
                        // Create a model using the connection
                        const mongooseSchema = new mongoose.Schema<IMongooseSchema>(schema)

                        const Model = conn.model<IMongooseSchema>(modelName, mongooseSchema, modelName)

                        // Test if the created connection model is working
                        const doc = new Model(docData)
                        await doc.save()

                        const foundDoc = await Model.findOne(docData)
                        expect(foundDoc).toEqual(expect.objectContaining(docData))
                    })
                })
            })

            // 🔄 === updateConnectionString() TEST ===
            describe('updateConnectionString()', () => {
                const dbName = 'newDbName'

                /** 
                 * Setup before each test to modify dbName property.
                 */
                beforeEach(() => {
                    // Must use reflect here because of read-only property
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

        /**
         * 🏛️ Describes the public methods of the MongooseUtils class.
         */
        describe('[PUBLIC]', () => {
            /**
             * 🔌 Describes the getConnection() method tests.
             */
            describe('getConnection()', () => {
                let initStub: sinon.SinonStub

                /**
                 * 🛠️ Sets up the environment before each test case.
                 * This will stub the init method of MongooseUtils to return a resolved promise.
                 */
                beforeEach(() => {
                    initStub = sinon.stub(
                        MongooseUtils.prototype, 'init' as keyof MongooseUtils
                    ).resolves()
                })

                /**
                 * 🆕 Describes tests for creating a new connection.
                 */
                describe('[NEW CONNECTION]', () => {
                    /**
                     * ✅ Tests that the init method is called when there is no existing connection.
                     * @returns {Promise<void>} Returns a promise that resolves when the test is complete.
                     */
                    it('should call init method because conn is null', async() => {
                        const conn = await mongooseUtils.getConnection()
                        expect(conn).toBe(null)
                        expect(initStub.calledOnce).toBe(true)
                    })
                })

                /**
                 * 🔄 Describes tests for an existing connection.
                 */
                describe('[EXISTING CONNECTION]', () => {
                    /**
                     * ✅ Tests that the init method is not called if a connection already exists.
                     * @returns {Promise<void>} Returns a promise that resolves when the test is complete.
                     */
                    it('should not call init method because conn not null', async() => {
                        const expectedConn = {} as mongoose.Connection
                        mongooseUtils['conn'] = expectedConn

                        const conn = await mongooseUtils.getConnection()
                        expect(initStub.called).toBe(false)
                        expect(conn).toEqual(expectedConn)
                    })
                })
            })

            /**
             * 🏗️ Describes the createModel() method tests.
             */
            describe('createModel()', () => {
                let createSchemaStub: sinon.SinonStub
                let getConnectionStub: sinon.SinonStub

                /**
                 * 🛠️ Sets up the environment before each test case.
                 * This will stub the createSchema and getConnection methods of MongooseUtils.
                 */
                beforeEach(() => {
                    createSchemaStub = sinon.stub(
                        MongooseUtils, 'createSchema'
                    ).returns(global.mongooseSchema as mongoose.Schema<unknown>)
                
                    getConnectionStub = sinon.stub(
                        MongooseUtils.prototype, 'getConnection' as keyof MongooseUtils
                    ).resolves(memoryModelDetails.conn)
                })

                /**
                 * ❌ Describes tests for error scenarios when creating a model.
                 */
                describe('[ERROR]', () => {
                    /**
                     * 🚫 Tests that the schema validation prevents document creation.
                     * @returns {Promise<void>} Returns a promise that resolves when the test is complete.
                     */
                    it('should validate schema and should not allow to create doc', async() => {
                        const { modelName, schema } = modelDetails
                
                        const Model = await mongooseUtils.createModel<IMongooseSchema>(schema, modelName)

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

                /**
                 * ✅ Describes tests for successful model creation.
                 */
                describe('[SUCCESS]', () => {
                    /**
                     * 🎉 Tests that a mongoose model can be successfully created.
                     * @returns {Promise<void>} Returns a promise that resolves when the test is complete.
                     */
                    it('should create a mongoose model', async() => {
                        const { modelName, schema } = modelDetails
                
                        const Model = await mongooseUtils.createModel<IMongooseSchema>(schema, modelName)

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