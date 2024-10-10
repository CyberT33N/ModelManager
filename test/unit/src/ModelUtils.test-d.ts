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
import type { IModelCore } from '@/src/ModelManager'

// ==== CODE TO TEST ====
import ModelUtils, { type IMemoryModel } from '@/src/ModelUtils'


describe('[TYPE TEST] - src/ModelUtils.ts', () => {
    let modelCoreDetails: IModelCore

     interface IMemoryModel_Test<TSchema> {
          /** Mongoose model instance */
          Model: mongoose.Model<TSchema>
          /** MongoMemoryServer instance for managing in-memory database */
          mongoServer: MongoMemoryServer
          /** Mongoose connection instance */
          conn: mongoose.Connection
     }

     beforeAll(async() => {
         const { modelName, dbName, schema }: IModelCore = await import('@/test/models/Test.model.mjs')

         modelCoreDetails = {
             modelName,
             dbName,
             schema
         }
     })

     describe('[INTERFACES]', () => {
         describe('[IMemoryModel]', () => {
             it('should verify interface type', () => {
                type TMongooseSchema = mongoose.ObtainDocumentType<typeof modelCoreDetails.schema>

                expectTypeOf<IMemoryModel<TMongooseSchema>>()
                    .toEqualTypeOf<IMemoryModel_Test<TMongooseSchema>>()
             })
         })
     })

     describe('[METHODS]', () => {
         describe('[STATIC]', () => {
             describe('createMemoryModel()', () => {
                 it('should verify param and return type', () => {
                     type TMongooseSchema = mongoose.ObtainDocumentType<typeof modelCoreDetails.schema>

                     expectTypeOf(
                         ModelUtils.createMemoryModel.bind(ModelUtils)
                     ).toBeCallableWith(modelCoreDetails)

                     expectTypeOf(
                        ModelUtils.createMemoryModel.bind(ModelUtils)<TMongooseSchema>
                     ).returns.resolves
                         .toEqualTypeOf<IMemoryModel<TMongooseSchema>>()
                 })
             })
         })
     })
})
