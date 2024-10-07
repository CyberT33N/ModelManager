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
import sinon from 'sinon'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import {
     describe, it, beforeAll, expectTypeOf
} from 'vitest'

// ==== INTERNAL ====
import MongooseUtils from '@/src/MongooseUtils'
import type { IModelCore } from '@/src/ModelManager'

// ==== CODE TO TEST ====
import ModelUtils, { type IMemoryModel } from '@/src/ModelUtils'

describe('[TYPE TEST] - src/ModelUtils.ts', () => {
     let mongooseSchema: mongoose.Schema<any>
     let modelCoreDetails: IModelCore<any>

     beforeAll(async () => {
          const { modelName, dbName, schema }: IModelCore<any> = await import('@/test/models/Test.model.mjs')

          // Generate a TypeScript type for the Mongoose schema's document structure
          type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>

          // Create the Mongoose schema using a utility function
          mongooseSchema = MongooseUtils.createSchema<TMongooseSchema>(schema, modelName)

          modelCoreDetails = {
               modelName,
               dbName,
               schema
          } as IModelCore<TMongooseSchema>
     })

     describe('[INTERFACES]', () => {
          describe('[IMemoryModel]', () => {
               interface IMemoryModel_Test<TSchema> {
                    /** Mongoose model instance */
                    Model: mongoose.Model<TSchema>
                    /** MongoMemoryServer instance for managing in-memory database */
                    mongoServer: MongoMemoryServer
                    /** Mongoose connection instance */
                    conn: mongoose.Connection
               }

               it('should verify interface type', () => {
                    const { schema } = modelCoreDetails

                    type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>
                         ;expectTypeOf<IMemoryModel<TMongooseSchema>>()
                              .toEqualTypeOf<IMemoryModel_Test<TMongooseSchema>>()
               })
          })
     })

     describe('[METHODS]', () => {
          describe('[STATIC]', () => {
               describe('createMemoryModel()', () => {
                    it('should verify param and return type', () => {
                         expectTypeOf(ModelUtils.createMemoryModel).toBeCallableWith(modelCoreDetails)
                         expectTypeOf(ModelUtils.createMemoryModel).returns.resolves
                              .toEqualTypeOf<IMemoryModel<any>>()
                    })
               })
          })
     })
})
