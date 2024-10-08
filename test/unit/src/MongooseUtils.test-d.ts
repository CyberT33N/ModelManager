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

describe('[TYPE TEST] - src/MongooseUtils.ts', () => {
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

    afterAll(async() => {
        // Calling stop() will close all connections from each created instance
        await mongoServer.stop()
    })

    beforeEach(() => {
        // Reset the instances map
        MongooseUtils['instances'] = new Map()

        mongooseUtils = MongooseUtils.getInstance(modelDetails.dbName)
        expect(mongooseUtils).toBeInstanceOf(MongooseUtils)
    })

    describe('getInstance()', () => {
        it('should verify param and return type', () => {
            expectTypeOf(MongooseUtils.getInstance).toBeCallableWith(modelDetails.dbName)
            expectTypeOf(MongooseUtils.getInstance).returns
                 .toEqualTypeOf<MongooseUtils>()
        })
    })

    describe('[METHODS]', () => {
        describe('[STATIC]', () => {
            describe('createSchema()', () => {
                it('should verify param and return type', () => {
                    const { modelName, schema } = modelDetails

                    // Generate the Mongoose schema type
                    type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>
                
                    expectTypeOf(MongooseUtils.createSchema).toBeCallableWith(schema, modelName)
                    expectTypeOf(MongooseUtils.createSchema<TMongooseSchema>).returns
                         .toEqualTypeOf<mongoose.Schema<TMongooseSchema>>()
                })
            })
        })

        describe('[PRIVATE]', () => {
            describe('init()', () => {
                it('should verify return type', () => {
                    expectTypeOf(mongooseUtils['init']).returns.resolves.toBeVoid()
                })
            })

            describe('updateConnectionString()', () => {
                it('should verify return type', () => {
                    expectTypeOf(mongooseUtils['updateConnectionString']).returns.toBeVoid()
                })
            })
        })

        describe('[PUBLIC]', () => {
            describe('getConnection()', () => {
                it('should verify return type', () => {
                    expectTypeOf(mongooseUtils.getConnection).returns.resolves
                        .toEqualTypeOf<mongoose.Connection>()
                })
            })

            describe('createModel()', () => {
                it('should verify param and return type', () => {
                    const { modelName, schema } = modelDetails

                    // Generate the Mongoose schema type
                    type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>
                
                    expectTypeOf(mongooseUtils.createModel).toBeCallableWith(schema, modelName)
                    expectTypeOf(mongooseUtils.createModel<TMongooseSchema>).returns.resolves
                         .toEqualTypeOf<mongoose.Model<TMongooseSchema>>()
                })
            })
        })
    })
})