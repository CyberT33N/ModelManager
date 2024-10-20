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
import { MongoMemoryServer } from 'mongodb-memory-server'
import {
    describe, it, beforeAll, expectTypeOf
} from 'vitest'

// ==== INTERNAL ====
import type { IModel } from '@/src/ModelManager'

// ==== CODE TO TEST ====
import ModelUtils, { type IMemoryModel } from '@/src/ModelUtils'
import type { IMongooseSchema } from '@/test/models/Test.model.ts'

describe('[TYPE TEST] - src/ModelUtils.ts', () => {
    let modelDetails: IModel<any>

    interface IMemoryModel_Test<TSchema> {
        /** Mongoose model instance */
        Model: mongoose.Model<TSchema>
        /** MongoMemoryServer instance for managing in-memory database */
        mongoServer: MongoMemoryServer
        /** Mongoose connection instance */
        conn: mongoose.Connection
        /** The URI of the in-memory database */
        mongoUri: string
    }

    beforeAll(() => {
        modelDetails = globalThis.modelDetails
    })

    describe('[INTERFACES]', () => {
        describe('[IMemoryModel]', () => {
            it('should verify interface type', () => {
                expectTypeOf<IMemoryModel<IMongooseSchema>>()
                    .toEqualTypeOf<IMemoryModel_Test<IMongooseSchema>>()
            })
        })
    })

    describe('[METHODS]', () => {
        describe('[STATIC]', () => {
            describe('createMemoryModel()', () => {
                it('should verify param and return type', () => {
                    expectTypeOf(
                        ModelUtils.createMemoryModel.bind(ModelUtils)
                    ).toBeCallableWith(modelDetails)

                    expectTypeOf(
                        ModelUtils.createMemoryModel.bind(ModelUtils)<IMongooseSchema>
                    ).returns.resolves
                        .toEqualTypeOf<IMemoryModel<IMongooseSchema>>()
                })
            })
        })
    })
})
