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

// 🛠️ ==== DEPENDENCIES ====
import sinon from 'sinon'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'
import {
    describe, it, expect, assert,
    beforeEach, beforeAll
} from 'vitest'

// 🔌 ==== INTERNAL ====
import MongooseUtils from '@/src/MongooseUtils'
import type { IModel } from '@/src/ModelManager'

// 🏗️ ==== CODE TO TEST ====
import ModelUtils from '@/src/ModelUtils'
import type { IMongooseSchema } from '@/test/models/Test.model.ts'

/**
 * @description Unit tests for ModelUtils functions.
 */
describe('[UNIT TEST] - src/ModelUtils.ts', () => {
    /** @type {mongoose.Schema} The Mongoose schema instance. */
    let mongooseSchema: mongoose.Schema
    /** @type {IModel<any>} The model details. */
    let modelDetails: IModel<any>
    /** @type {Record<string, any>} Document data for testing. */
    let docData: Record<string, any>

    /**
     * @description Sets up global variables before all tests.
     */
    beforeAll(() => {
        modelDetails = globalThis.modelDetails
        mongooseSchema = globalThis.mongooseSchema
        docData = globalThis.docData
    })

    describe('[METHODS]', () => {
        describe('[STATIC]', () => {
            describe('createMemoryModel()', () => {
                /** @type {sinon.SinonStub} Stub for createSchema method. */
                let mongooseUtilsCreateSchemaStub: sinon.SinonStub
                /** @type {sinon.SinonSpy} Spy for MongoMemoryServer create method. */
                let mongoMemoryServerSpy: sinon.SinonSpy
                /** @type {sinon.SinonSpy} Spy for mongoose createConnection method. */
                let mongooseConnectSpy: sinon.SinonSpy

                /**
                 * @description Sets up spies and stubs before each test.
                 */
                beforeEach(() => {
                    mongoMemoryServerSpy = sinon.spy(MongoMemoryServer, 'create')
                    mongooseConnectSpy = sinon.spy(mongoose, 'createConnection')
                    mongooseUtilsCreateSchemaStub = sinon.stub(MongooseUtils, 'createSchema')
                        .returns(mongooseSchema as mongoose.Schema<unknown>)
                })

                describe('[ERROR]', () => {
                    it('should validate schema and should not allow to create doc', async() => { 
                        // 🛑 Attempt to create a new document with invalid schema.
                        const { Model } = await ModelUtils
                            .createMemoryModel<IMongooseSchema>(modelDetails)

                        try {
                            // 🗒️ Creating document with invalid fields.
                            const doc = new Model({ notValid: true })
                            await doc.save()

                            assert.fail('This line should not be reached')
                        } catch (err) {
                            // ✅ Validate that a ValidationError is thrown.
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
                        // ⚙️ Extract schema details from model.
                        const { schema, modelName, dbName } = modelDetails

                        // 🔄 Create memory model using ModelUtils.
                        const {
                            Model, mongoServer, conn
                        } = await ModelUtils.createMemoryModel<IMongooseSchema>(modelDetails)

                        // 🔍 ==== SPIES/STUBS ====
                        expect(mongooseUtilsCreateSchemaStub.calledOnceWithExactly(
                            schema, { collection: modelName })
                        ).toBe(true)

                        expect(mongoMemoryServerSpy.calledOnceWithExactly({
                            instance: { dbName }
                        })).toBe(true)

                        expect(mongooseConnectSpy.calledOnce).toBe(true)

                        // ✅ ==== EXPECTATIONS ====
                        expect(Model.modelName).toEqual(modelName)
                        expect(mongoServer).toBeInstanceOf(MongoMemoryServer)
                        expect(conn).toBeInstanceOf(mongoose.Connection)

                        // 📝 Test if the created connection model is working
                        const doc = new Model(docData)
                        expect(doc).toBeInstanceOf(mongoose.Model)
                        await doc.save()

                        // 🔍 Validate that the saved document can be found.
                        const foundDoc = await Model.findOne(docData)
                        expect(foundDoc).toEqual(expect.objectContaining(docData))
                    })
                })
            })
        })
    })
})
