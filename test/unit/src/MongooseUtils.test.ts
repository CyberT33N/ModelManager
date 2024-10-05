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
    beforeEach, afterEach, beforeAll
} from 'vitest'

import {
    BaseError,
    type IBaseError
} from 'error-manager-helper'

// ==== INTERNAL ====
import type { IModel, IModelCore } from '@/src/ModelManager'

// ==== CODE TO TEST ====
import MongooseUtils from '@/src/MongooseUtils'

describe('MongooseUtils', () => {
    let modelDetails: IModel<any> 
    let mongooseUtils: MongooseUtils

    const dbName = 'test'

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

    beforeEach(() => {
        (<any>MongooseUtils).instances = new Map()
        mongooseUtils = MongooseUtils.getInstance(dbName)
        expect(mongooseUtils).toBeInstanceOf(MongooseUtils)
    })

    describe('getInstance()', () => {
        describe('[EXISTING INSTANCE]', () => {
            beforeEach(() => {
                ;(<any>mongooseUtils).changed = true
            })
             
            it('should get existing instance for db', async() => {
                const mongooseUtils2 = MongooseUtils.getInstance(dbName)
                expect(mongooseUtils2).toEqual(mongooseUtils)

                expect((<any>MongooseUtils).instances.size).toBe(1)
                
                expect(Reflect.get(mongooseUtils2, 'changed')).toBe(true)
                expect(Reflect.get(mongooseUtils2, 'dbName')).toBe(dbName)
            })
        })

        describe('[NEW INSTANCE]', () => {
            const dbName2 = 'test2'

            it('should create new instance and set default properties', async() => {
                expect(Reflect.get(mongooseUtils, 'dbName')).toBe(dbName)
                expect(Reflect.get(mongooseUtils, 'conn')).toBe(null)
                expect(Reflect.get(mongooseUtils, 'connectionString'))
                .toBe(process.env.MONGODB_CONNECTION_STRING)
            })

            it('should create new instance if instance for db not exists', async() => {
                // ==== INSTANCE #1 ====
                expect((<any>MongooseUtils).instances.size).toBe(1)

                // ==== INSTANCE #2 ====
                const mongooseUtils2 = MongooseUtils.getInstance(dbName2)
                expect(mongooseUtils2).toBeInstanceOf(MongooseUtils)
                expect(mongooseUtils2).not.toEqual(mongooseUtils)

                expect((<any>MongooseUtils).instances.size).toBe(2)
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
                let createConnectionStub: sinon.SinonStub
                let updateConnectionStringStub: sinon.SinonStub
 
                beforeEach(() => {
                    createConnectionStub = sinon.stub(mongoose, 'createConnection')
                    updateConnectionStringStub = sinon.stub(
                        MongooseUtils.prototype, 'updateConnectionString' as keyof MongooseUtils
                    ).resolves()
                })

                afterEach(() => {
                    updateConnectionStringStub.restore()
                    createConnectionStub.restore()
                })

                describe('[ERROR]', () => {
                    const expectedErrorMessage = 'Connection error'

                    beforeEach(() => {
                        const error = new Error(expectedErrorMessage)

                        createConnectionStub.returns({
                            asPromise: () => Promise.reject(error)
                        } as unknown as mongoose.Connection)
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
                    beforeEach(() => {
                        createConnectionStub.returns({
                            asPromise: () => Promise.resolve({})
                        })
                    })

                    it('should initialize connection with mongoose', async function() {
                        await (<any>mongooseUtils).init()

                        expect(createConnectionStub.calledOnce).toBeTruthy()
                        expect(updateConnectionStringStub.calledOnce).toBeTruthy()
                        expect(createConnectionStub.calledWith(
                            Reflect.get(mongooseUtils, 'connectionString')
                        )).toBe(true)
                        expect(Reflect.get(mongooseUtils, 'conn')).toBeInstanceOf(mongoose.Connection)
                    })
                })
            })

            describe('updateConnectionString()', () => {
                it('should update the connection string with the correct database name', () => {
                    const expectedConnectionString = `${process.env.MONGODB_CONNECTION_STRING}/${dbName}`
    
                    const expectedDbName = 'newDB'
                    ;(<any>mongooseUtils).dbName = expectedDbName
                    ;(<any>mongooseUtils).updateConnectionString()

                    const newConnectionString = Reflect.get(mongooseUtils, 'connectionString')
                    const urlObj = new URL(newConnectionString)

                    expect(urlObj.pathname).toBe(`/${expectedDbName}`)
                })
            })
        })

        describe('[PUBLIC]', () => {
            describe('getConnection', () => {
                let initSpy: sinon.SinonSpy

                beforeEach(async() => {
                    initSpy = sinon.spy((<any>MongooseUtils).prototype, 'init')
                    await (<any>mongooseUtils).init()
                })
       
                afterEach(() => {
                    initSpy.restore()
                })
       
                it('should return a valid existing mongoose connection', async() => {
                    const conn = await mongooseUtils.getConnection()
                    expect(initSpy.calledTwice).toBe(false)
                    expect(conn).toBeInstanceOf(mongoose.Connection)
                })

                it('should return a valid mongoose connection by creating one', async() => {
                    delete (<any>mongooseUtils).conn

                    const conn = await mongooseUtils.getConnection()
                    expect(initSpy.calledTwice).toBe(true)
                    expect(conn).toBeInstanceOf(mongoose.Connection)
                })
            })

            describe('createModel', () => {
                let createSchemaSpy: sinon.SinonSpy
                let getConnectionSpy: sinon.SinonSpy

                beforeEach(() => {
                    createSchemaSpy = sinon.spy(MongooseUtils, 'createSchema')
                    getConnectionSpy = sinon.spy((<any>MongooseUtils).prototype, 'getConnection')
                })
      
                afterEach(() => {
                    createSchemaSpy.restore()
                    getConnectionSpy.restore()
                })
               
                it('should create a mongoose model', async() => {
                    const schema = {
                        name: String,
                        age: Number,
                        email: String
                    }

                    const name = 'User'

                    const Model = await mongooseUtils.createModel(schema, name)

                    // ==== SPIES ====
                    expect(createSchemaSpy.calledOnce).toBe(true)
                    expect(getConnectionSpy.calledOnce).toBe(true)

                    expect(Model.modelName).toBe(name)
                })
            })
        })
    })
})