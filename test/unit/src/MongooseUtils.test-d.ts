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

import {
    describe, it,
    expect, expectTypeOf,
    beforeEach, beforeAll
} from 'vitest'

// ==== INTERNAL ====
import type { IModel } from '@/src/ModelManager'

// ==== CODE TO TEST ====
import MongooseUtils from '@/src/MongooseUtils'

describe('[TYPE TEST] - src/MongooseUtils.ts', () => {
    let mongooseUtils: MongooseUtils
    let modelDetails: IModel<any>

    beforeAll(() => {
        modelDetails = globalThis.modelDetails
    })

    beforeEach(() => {
        // Reset the instances map
        MongooseUtils['instances'] = new Map()

        mongooseUtils = MongooseUtils.getInstance(modelDetails.dbName)
        expect(mongooseUtils).toBeInstanceOf(MongooseUtils)
    })

    describe('getInstance()', () => {
        it('should verify param and return type', () => {
            expectTypeOf(MongooseUtils.getInstance.bind(MongooseUtils)).toBeCallableWith(modelDetails.dbName)
            expectTypeOf(MongooseUtils.getInstance.bind(MongooseUtils)).returns
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
                
                    expectTypeOf(
                        MongooseUtils.createSchema.bind(MongooseUtils)
                    ).toBeCallableWith(schema, { collection: modelName })

                    expectTypeOf(
                        MongooseUtils.createSchema.bind(MongooseUtils)<TMongooseSchema>
                    ).returns
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
                    expectTypeOf(mongooseUtils.getConnection.bind(mongooseUtils)).returns.resolves
                        .toEqualTypeOf<mongoose.Connection>()
                })
            })

            describe('createModel()', () => {
                it('should verify param and return type', () => {
                    const { modelName, schema } = modelDetails

                    // Generate the Mongoose schema type
                    type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>
                
                    expectTypeOf(
                        mongooseUtils.createModel.bind(mongooseUtils)
                    ).toBeCallableWith(schema, modelName)

                    expectTypeOf(
                        mongooseUtils.createModel.bind(mongooseUtils)<TMongooseSchema>
                    ).returns.resolves
                        .toEqualTypeOf<mongoose.Model<TMongooseSchema>>()
                })
            })
        })
    })
})