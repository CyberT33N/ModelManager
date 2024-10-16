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
    describe, it, expect, assert,
    beforeEach, afterEach, beforeAll
} from 'vitest'

// ==== INTERNAL ====
import MongooseUtils from '@/src/MongooseUtils'
import type { IModel } from '@/src/ModelManager'

// ==== CODE TO TEST ====
import ModelUtils from '@/src/ModelUtils'

describe('[UNIT TEST] - src/ModelUtils.ts', () => {
    let mongooseSchema: mongoose.Schema
    let modelDetails: IModel<any>
    let docData: Record<string, any>

    beforeAll(() => {
        modelDetails = globalThis.modelDetails
        mongooseSchema = globalThis.mongooseSchema
        docData = globalThis.docData
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
                        .returns(mongooseSchema as mongoose.Schema<unknown>)
                })

                describe('[ERROR]', () => {
                    it('should validate schema and should not allow to create doc', async() => { 
                        // Generate the Mongoose schema type
                        type TMongooseSchema = mongoose.ObtainDocumentType<typeof modelDetails.schema>

                        const { Model } = await ModelUtils
                            .createMemoryModel<TMongooseSchema>(modelDetails)

                        try {
                            const doc = new Model({ notValid: true })
                            await doc.save()

                            assert.fail('This line should not be reached')
                        } catch (err) {
                            if (err instanceof mongoose.Error.ValidationError) {
                                expect(err.errors.name.message).toEqual('Path `name` is required.')
                                expect(err.errors.decimals.message).toEqual('Path `decimals` is required.')
                                return
                            }

                            assert.fail('This line should not be reached')
                        }
                    })
                })

                describe('[SUCCESS]', () => {
                    it('should return the memory model, server and conn', async() => {
                        const { schema, modelName, dbName } = modelDetails
                         
                        // Generate the Mongoose schema type
                        type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>

                        const {
                            Model, mongoServer, conn
                        } = await ModelUtils.createMemoryModel<TMongooseSchema>(modelDetails)

                        // ==== SPIES/STUBS ====
                        expect(mongooseUtilsCreateSchemaStub.calledOnceWithExactly(
                            schema, { collection: modelName })
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
})
