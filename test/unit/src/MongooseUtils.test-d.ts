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

// 🌟 ==== DEPENDENCIES ====
import mongoose from 'mongoose'

import {
    describe, it,
    expect, expectTypeOf,
    beforeEach, beforeAll
} from 'vitest'

// 🔌 ==== INTERNAL ====
import type { IModel } from '@/src/ModelManager'

// 🛠️ ==== CODE TO TEST ====
import MongooseUtils from '@/src/MongooseUtils'
import type { IMongooseSchema } from '@/test/models/Test.model.ts'

// 🧪 Describe test suite for MongooseUtils type tests
describe('[TYPE TEST] - src/MongooseUtils.ts', () => {
    let mongooseUtils: MongooseUtils // 🛠️ Instance of MongooseUtils
    let modelDetails: IModel<any> // 📊 Model details

    // 🔄 Setup before all tests
    beforeAll(() => {
        modelDetails = globalThis.modelDetails // 📦 Assign model details from global context
    })

    // 🔄 Reset instances before each test
    beforeEach(() => {
        MongooseUtils['instances'] = new Map() // 🗄️ Reset the instances map

        mongooseUtils = MongooseUtils.getInstance(modelDetails.dbName) // 🔗 Get MongooseUtils instance
        expect(mongooseUtils).toBeInstanceOf(MongooseUtils) // ✅ Verify instance type
    })

    // 📜 Test for getInstance method
    describe('getInstance()', () => {
        it('should verify param and return type', () => {
            expectTypeOf(MongooseUtils.getInstance.bind(MongooseUtils)).toBeCallableWith(
                modelDetails.dbName // 📦 Check if it accepts dbName
            )
            expectTypeOf(MongooseUtils.getInstance.bind(MongooseUtils)).returns
                .toEqualTypeOf<MongooseUtils>() // 🔍 Verify return type
        })
    })

    // 📜 Test methods within MongooseUtils
    describe('[METHODS]', () => {
        // ⚙️ Static methods section
        describe('[STATIC]', () => {
            // 📝 Test createSchema method
            describe('createSchema()', () => {
                it('should verify param and return type', () => {
                    const { modelName, schema } = modelDetails // 📦 Destructure model details

                    expectTypeOf(
                        MongooseUtils.createSchema.bind(MongooseUtils)
                    ).toBeCallableWith(schema, { collection: modelName }) // 📋 Check params

                    expectTypeOf(
                        MongooseUtils.createSchema.bind(MongooseUtils)<IMongooseSchema>
                    ).returns
                        .toEqualTypeOf<mongoose.Schema<IMongooseSchema>>() // 🔍 Verify return type
                })
            })
        })

        // ⚙️ Private methods section
        describe('[PRIVATE]', () => {
            // 🛠️ Test init method
            describe('init()', () => {
                it('should verify return type', () => {
                    expectTypeOf(mongooseUtils['init']).returns.resolves.toBeVoid()
                })
            })

            // 🛠️ Test updateConnectionString method
            describe('updateConnectionString()', () => {
                it('should verify return type', () => {
                    expectTypeOf(mongooseUtils['updateConnectionString']).returns.toBeVoid()
                })
            })
        })

        // ⚙️ Public methods section
        describe('[PUBLIC]', () => {
            // 🛠️ Test getConnection method
            describe('getConnection()', () => {
                it('should verify return type', () => {
                    expectTypeOf(mongooseUtils.getConnection.bind(mongooseUtils)).returns.resolves
                        .toEqualTypeOf<mongoose.Connection>()
                })
            })

            // 🛠️ Test createModel method
            describe('createModel()', () => {
                it('should verify param and return type', () => {
                    const { modelName, schema } = modelDetails

                    expectTypeOf(
                        mongooseUtils.createModel.bind(mongooseUtils)
                    ).toBeCallableWith(schema, modelName)

                    expectTypeOf(
                        mongooseUtils.createModel.bind(mongooseUtils)<IMongooseSchema>
                    ).returns.resolves
                        .toEqualTypeOf<mongoose.Model<IMongooseSchema>>()
                })
            })
        })
    })
})
