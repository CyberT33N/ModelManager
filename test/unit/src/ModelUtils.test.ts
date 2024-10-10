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
    describe, it, expect, beforeEach, afterEach, beforeAll
} from 'vitest'

// ==== INTERNAL ====
import MongooseUtils from '@/src/MongooseUtils'
import type { IModelCore } from '@/src/ModelManager'

// ==== CODE TO TEST ====
import ModelUtils from '@/src/ModelUtils'

describe('[UNIT TEST] - src/ModelUtils.ts', () => {
    let mongooseSchema: mongoose.Schema<unknown>
    let modelCoreDetails: IModelCore

    const docData = { name: 'test', decimals: 69n }

    beforeAll(async() => {
        const { modelName, dbName, schema }: IModelCore = await import('@/test/models/Test.model.mjs')

        // Create the Mongoose schema using a utility function
        mongooseSchema = MongooseUtils.createSchema(schema, modelName)

        modelCoreDetails = {
            modelName,
            dbName,
            schema
        }
    })

    describe('[METHODS]', () => {
        describe('[STATIC]', () => {
            describe('createMemoryModel()', () => {
                let mongooseUtilsCreateSchemaStub: sinon.SinonStub
                let mongoMemoryServerSpy: sinon.SinonSpy
                let mongooseConnectSpy: sinon.SinonSpy

                beforeEach(() => {
                    mongoMemoryServerSpy = sinon.spy(MongoMemoryServer, 'create')
                    mongooseConnectSpy = sinon.spy(mongoose, 'createConnection')
                    mongooseUtilsCreateSchemaStub = sinon.stub(MongooseUtils, 'createSchema')
                        .returns(mongooseSchema)
                })

                afterEach(() => {
                    mongooseUtilsCreateSchemaStub.restore()
                    mongoMemoryServerSpy.restore()
                    mongooseConnectSpy.restore()
                })

                it('should return the memory model, server and conn', async() => {
                    const { schema, modelName, dbName } = modelCoreDetails
                         
                    const {
                        Model, mongoServer, conn
                    } = await ModelUtils.createMemoryModel(modelCoreDetails)

                    // ==== SPIES/STUBS ====
                    expect(mongooseUtilsCreateSchemaStub.calledOnceWithExactly(
                        schema, modelName)
                    ).toBe(true)

                    expect(mongoMemoryServerSpy.calledOnceWithExactly({
                        instance: { dbName }
                    })).toBe(true)

                    expect(mongooseConnectSpy.calledOnce).toBe(true)

                    // ==== EXPECTATIONS ====
                    expect(Model.modelName).toEqual(modelName)
                    expect(mongoServer).toBeInstanceOf(MongoMemoryServer)
                    expect(conn).toBeInstanceOf(mongoose.Connection)

                    // Test if the created connection model is working
                    const doc = new Model(docData)
                    expect(doc).toBeInstanceOf(mongoose.Model)
                    await doc.save()

                    const foundDoc = await Model.findOne(docData)
                    expect(foundDoc).toEqual(expect.objectContaining(docData))
                })
            })
        })
    })
})
