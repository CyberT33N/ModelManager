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
                type TMongooseSchema = mongoose.ObtainDocumentType<typeof modelDetails.schema>

                expectTypeOf<IMemoryModel<TMongooseSchema>>()
                    .toEqualTypeOf<IMemoryModel_Test<TMongooseSchema>>()
            })
        })
    })

    describe('[METHODS]', () => {
        describe('[STATIC]', () => {
            describe('createMemoryModel()', () => {
                it('should verify param and return type', () => {
                     type TMongooseSchema = mongoose.ObtainDocumentType<typeof modelDetails.schema>

                     expectTypeOf(
                         ModelUtils.createMemoryModel.bind(ModelUtils)
                     ).toBeCallableWith(modelDetails)

                     expectTypeOf(
                        ModelUtils.createMemoryModel.bind(ModelUtils)<TMongooseSchema>
                     ).returns.resolves
                         .toEqualTypeOf<IMemoryModel<TMongooseSchema>>()
                })
            })
        })
    })
})
