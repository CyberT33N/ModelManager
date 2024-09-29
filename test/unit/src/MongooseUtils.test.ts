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
import mongoose from 'mongoose'
import sinon from 'sinon'
import {
    BaseError,
    type BaseErrorInterface
} from 'error-manager-helper'

// ==== FILES TO TEST ====
import MongooseUtils from '@/src/MongooseUtils'

describe('MongooseUtils', () => {
    let mongooseUtils: MongooseUtils

    const dbName = 'test'
    const dbName2 = 'test2'

    beforeEach(() => {
        (<any>MongooseUtils).instances = new Map()
        mongooseUtils = MongooseUtils.getInstance(dbName)
        expect(mongooseUtils).toBeInstanceOf(MongooseUtils)
    })

    describe('getInstance()', () => {
        describe('[NEW INSTANCE]', () => {
            it('should create new instance if instance for db not exist', async() => {
                expect(Reflect.get(mongooseUtils, 'connectionString')).toBe(process.env.MONGODB_CONNECTION_STRING)
                expect(Reflect.get(mongooseUtils, 'dbName')).toBe(dbName)
                expect(Reflect.get(mongooseUtils, 'conn')).toBe(null)
                expect((<any>MongooseUtils).instances.size).toBe(1)

                const mongooseUtils2 = MongooseUtils.getInstance(dbName2)
                expect(mongooseUtils2).toBeInstanceOf(MongooseUtils)
                expect(Reflect.get(mongooseUtils2, 'connectionString')).toBe(process.env.MONGODB_CONNECTION_STRING)
                expect(Reflect.get(mongooseUtils2, 'dbName')).toBe(dbName2)
                expect(Reflect.get(mongooseUtils2, 'conn')).toBe(null)
                expect((<any>MongooseUtils).instances.size).toBe(2)
            })
        })

        describe('[EXISTING INSTANCE]', () => {
            beforeEach(() => {
                ;(<any>mongooseUtils).changed = true
            })
             
            it('should get existing instance for db', async() => {
                const mongooseUtils2 = MongooseUtils.getInstance(dbName)
    
                expect(Reflect.get(mongooseUtils2, 'changed')).toBe(true)
                expect(Reflect.get(mongooseUtils2, 'dbName')).toBe(dbName)
            })
        })
    })

    describe('[METHODS]', () => {
        describe('[PRIVATE]', function() {
            describe('updateConnectionString', () => {
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

            describe('init()', function() {
                describe('[ERROR]', function() {
                    let createConnectionStub: sinon.SinonStub
                    let connStub: sinon.SinonStub

                    const expectedErrorMessage = 'Connection error'

                    beforeEach(() => {
                        const error = new Error(expectedErrorMessage)
                        // @ts-expect-error
                        createConnectionStub = sinon.stub(mongoose, 'createConnection').returns({
                            asPromise: () => Promise.reject(error)
                        })

                        connStub = sinon.stub(<any>mongooseUtils, 'conn').value(undefined)
                    })

                    afterEach(async() => {
                        createConnectionStub.restore()
                        connStub.restore()
                    })

                    it('should throw an error when initializing connection with mongoose fails', async function() {
                        try {
                            await (<any>mongooseUtils).init()
                            expect('This line should not be reached').toBe('Error')
                        } catch (err: unknown) {
                            const typedErr = err as BaseErrorInterface
                            expect(typedErr).toBeInstanceOf(BaseError)
                            expect(typedErr.message).toBe('MongooseUtils() - Error while init connection with mongoose')
                            expect(typedErr.error?.message).toBe(expectedErrorMessage)
                        }
                    })
                })

                describe('[SUCCESS]', function() {
                    let createConnectionSpy: sinon.SinonSpy
                    let updateConnectionStringSpy: sinon.SinonSpy

                    beforeEach(() => {
                        createConnectionSpy = sinon.spy(mongoose, 'createConnection')
                        updateConnectionStringSpy = sinon.spy(<any>mongooseUtils, 'updateConnectionString')
                    })

                    afterEach(async() => {
                        createConnectionSpy.restore()
                        updateConnectionStringSpy.restore()
                    })

                    it('should initialize connection with mongoose', async function() {
                        await (<any>mongooseUtils).init()
                        expect(createConnectionSpy.calledOnce).toBeTruthy()
                        expect(updateConnectionStringSpy.calledOnce).toBeTruthy()
                        expect(createConnectionSpy.calledWith(
                            Reflect.get(mongooseUtils, 'connectionString')
                        )).toBe(true)
                        expect(Reflect.get(mongooseUtils, 'conn')).toBeInstanceOf(mongoose.Connection)
                    })
                })
            })
        })

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
                    const schema = {
                        name: String,
                        age: Number,
                        email: String
                    }

                    const name = 'User'

                    const mongooseSchema = MongooseUtils.createSchema(schema, name)
                    expect(mongooseSchema).toBeInstanceOf(mongoose.Schema)
                    expect(schemaSpy.calledOnce).toBe(true)
                    expect(schemaSpy.calledWith(schema, { collection: name })).toBe(true)
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