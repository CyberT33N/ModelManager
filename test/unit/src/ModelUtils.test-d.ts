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

/**
 * 🧪 Tests for the ModelUtils module.
 */
describe('[TYPE TEST] - src/ModelUtils.ts', () => {
    /** 
     * 📚 Holds details about the model.
     */
    let modelDetails: IModel<any>

    /**
     * 🧠 Represents a test instance of a Mongoose model in memory.
     * 
     * @interface IMemoryModel_Test
     * @template TSchema - The type of the schema for the Mongoose model.
     * @property {mongoose.Model<TSchema>} Model - Mongoose model instance.
     * @property {MongoMemoryServer} mongoServer - MongoMemoryServer instance for managing
     * in-memory database.
     * @property {mongoose.Connection} conn - Mongoose connection instance.
     * @property {string} mongoUri - The URI of the in-memory database.
     */
    interface IMemoryModel_Test<TSchema> {
        Model: mongoose.Model<TSchema>
        mongoServer: MongoMemoryServer
        conn: mongoose.Connection
        mongoUri: string
    }

    /**
     * 🔄 Sets up the test environment before all tests run.
     */
    beforeAll(() => {
        modelDetails = globalThis.modelDetails
    })

    describe('[INTERFACES]', () => {
        describe('[IMemoryModel]', () => {
            /**
             * 🔍 Verifies the IMemoryModel interface type.
             */
            it('should verify interface type', () => {
                expectTypeOf<IMemoryModel<IMongooseSchema>>()
                    .toEqualTypeOf<IMemoryModel_Test<IMongooseSchema>>()
            })
        })
    })

    describe('[METHODS]', () => {
        describe('[STATIC]', () => {
            describe('createMemoryModel()', () => {
                /**
                 * 🔧 Verifies param and return type for createMemoryModel method.
                 */
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
