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

/**
 * 📦 Import external dependencies
 * @module sinon - Standalone test spies, stubs and mocks for JavaScript
 * @module lodash - A modern JavaScript utility library delivering modularity, performance & extras
 * @module glob - A little globber
 * @module error-manager-helper - Custom error management utility
 * @module vitest - Next generation testing framework
 */
import sinon from 'sinon'
import _ from 'lodash'
import { glob } from 'glob'
import {
    ValidationError, ResourceNotFoundError
} from 'error-manager-helper'
import {
    assert,
    describe, it,
    beforeEach, afterEach, beforeAll,
    expect
} from 'vitest'

/**
 * 🏠 Import internal dependencies
 * @module ModelManager - Manages models in the application
 * @module ModelUtils - Utility functions for working with models
 */
import ModelManager, { type IModel } from '@/src/ModelManager'
import ModelUtils, { type IMemoryModel } from '@/src/ModelUtils'

/**
 * 🧪 Import code to test
 * @module FixturesManager - Manages fixtures for testing
 */
import FixturesManager, {
    type IFixtureDoc, type IFixtures
} from '@/src/FixturesManager'

/**
 * 📚 Test suite for FixturesManager
 * @description Unit tests for the FixturesManager module
 */
describe('[UNIT TEST] - src/FixtureManager.ts', () => {
    /**
     * 🔧 Test setup variables
     * @type {FixturesManager} fixturesManager - Instance of FixturesManager
     * @type {sinon.SinonStub} initStub - Stub for the init method
     */
    let fixturesManager: FixturesManager
    let initStub: sinon.SinonStub

    /**
     * 📊 Test data variables
     * @type {IFixtures<IFixtureDoc>} fixtures - Fixture data
     * @type {IFixtureDoc} fixturesDoc - First fixture document
     * @type {IFixtureDoc} fixturesDoc2 - Second fixture document
     * @type {string} docId - ID of the first document
     * @type {string} docId2 - ID of the second document
     */
    let fixtures: IFixtures<IFixtureDoc>
    let fixturesDoc: IFixtureDoc
    let fixturesDoc2: IFixtureDoc
    let docId: string
    let docId2: string

    /**
     * 📋 Model details variables
     * @type {IModel<any>} modelDetails - Details of the model
     * @type {IMemoryModel<any>} memoryModelDetails - Details of the memory model
     */
    let modelDetails: IModel<any>
    let memoryModelDetails: IMemoryModel<any>

    /**
     * 🗄️ Database and collection names
     * @type {string} dbName - Name of the database
     * @type {string} collectionName - Name of the collection
     */
    const dbName = 'test'
    const collectionName = 'test.Test'

    /**
     * 🏁 Before all tests setup
     * @description Imports fixtures and sets up test data
     */
    beforeAll(async() => {
        modelDetails = globalThis.modelDetails
        memoryModelDetails = globalThis.memoryModelDetails

        fixturesDoc = await import('@/test/fixtures/test/test.Test/0_test.mjs') as IFixtureDoc
        fixturesDoc2 = await import('@/test/fixtures/test/test.Test/1_test.mjs') as IFixtureDoc
        docId = fixturesDoc.docContents._id.toString()
        docId2 = fixturesDoc2.docContents._id.toString()

        fixtures = {
            [dbName]: {
                [collectionName]: {
                    [docId]: fixturesDoc,
                    [docId2]: fixturesDoc2
                }
            }
        }
    })

    /**
     * 🔄 Before each test setup
     * @description Resets the FixturesManager instance and stubs
     */
    beforeEach(async() => {
        initStub = sinon.stub(
            FixturesManager.prototype, 'init' as keyof FixturesManager
        ).resolves()

        // Reset instance before creating a new one
        Reflect.set(FixturesManager, 'instance', undefined)
        fixturesManager = await FixturesManager.getInstance()
        fixturesManager.fixtures = _.cloneDeep(fixtures)
    })

    /**
     * 🧹 After each test cleanup
     * @description Cleans up all fixtures after each test
     */
    afterEach(async() => {
        await fixturesManager.cleanAll()
    })

    /**
     * 🏭 Test suite for getInstance method
     * @description Tests the singleton pattern implementation
     */
    describe('getInstance()', () => {
        /**
         * 🧪 Test case: Creating a new instance
         * @description Verifies that a new instance is created correctly
         */
        it('should create new instance', () => {
            expect(initStub.calledOnce).toBe(true)
            expect(fixturesManager).toBeInstanceOf(FixturesManager)
            expect(fixturesManager.fixtures).toEqual(fixtures)
        })

        /**
         * 🧪 Test case: Returning an existing instance
         * @description Verifies that the existing instance is returned
         */
        it('should return existing instance', async() => {
            const fixturesManager2 = await FixturesManager.getInstance()
            expect(initStub.calledOnce).toBe(true)
            expect(fixturesManager2.fixtures).toEqual(fixtures)
            expect(fixturesManager2).toBeInstanceOf(FixturesManager)
        })
    })

    describe('[METHODS]', () => {
        /**
         * 🔒 Test suite for private methods
         * @description Tests the internal workings of FixturesManager
         */
        describe('[PRIVATE]', () => {
            /**
             * 🚀 Test suite for init method
             * @description Tests the initialization process of FixturesManager
             */
            describe('init()', () => {
                /**
                 * 🔧 Test setup variables
                 * @type {sinon.SinonStub} globFixturesStub - Stub for globFixtures method
                 * @type {sinon.SinonStub} getInstanceStub - Stub for ModelManager.getInstance
                 */
                let globFixturesStub: sinon.SinonStub
                let getInstanceStub: sinon.SinonStub

                /**
                 * 🔄 Before each test setup
                 * @description Sets up stubs for init method tests
                 */
                beforeEach(() => {
                    initStub.restore()

                    globFixturesStub = sinon.stub(
                        FixturesManager.prototype, 'globFixtures' as keyof FixturesManager
                    ).resolves({})

                    getInstanceStub = sinon.stub(
                        ModelManager, 'getInstance'
                    ).resolves()
                })

                /**
                 * 🧪 Test case: Initializing fixtures
                 * @description Verifies that fixtures are initialized correctly
                 */
                it('should initialize fixtures if not already initialized', async() => {
                    fixturesManager.fixtures = {}

                    await fixturesManager['init']()

                    // ==== SPIES/STUBS ====
                    expect(getInstanceStub.calledOnce).toBe(true)
                    expect(
                        globFixturesStub.calledOnceWithExactly(`${process.cwd()}/test/fixtures/**/*.mjs`)
                    ).toBe(true)

                    // ==== EXPECTATIONS ====
                    expect(fixturesManager.fixtures).toEqual({})
                })

                /**
                 * 🧪 Test case: Skipping initialization
                 * @description Verifies that initialization is skipped if fixtures are already present
                 */
                it('should not initialize fixtures if already initialized', async() => {
                    await fixturesManager['init']()
                    
                    // ==== SPIES/STUBS ====
                    expect(globFixturesStub.called).toBe(false)

                    // ==== EXPECTATIONS ====
                    expect(fixturesManager.fixtures).toEqual(fixtures)
                })
            })

            /**
             * 🌐 Test suite for globFixtures method
             * @description Tests the fixture globbing process
             */
            describe('globFixtures()', () => {
                /**
                 * ❌ Test suite for error scenarios
                 * @description Tests error handling in globFixtures method
                 */
                describe('[ERROR]', () => {
                    /**
                     * 🔧 Test setup variables
                     * @type {IFixtureDoc} fixturesDocDuplicated - Duplicated fixture document
                     */
                    let fixturesDocDuplicated: IFixtureDoc

                    /**
                     * 🏁 Before all tests setup
                     * @description Imports duplicated fixture document
                     */
                    beforeAll(async() => {
                        fixturesDocDuplicated = await import(
                            '@/test/fixtures/error/duplicated/0_test.mjs'
                        ) as IFixtureDoc
                    })

                    /**
                     * 🧪 Test case: Handling duplicate fixture ids
                     * @description Verifies that an error is thrown for duplicate fixture ids
                     */
                    it('should throw an error if there are duplicate fixture ids', async() => {
                        const expression = `${process.cwd()}/test/fixtures/error/**/*.mjs`
                        const docId = fixturesDocDuplicated.docContents._id.toString()

                        try {
                            await fixturesManager['globFixtures'](expression)
                            assert.fail('This line should not be reached')
                        } catch (err) {
                            if (err instanceof ValidationError) {
                                expect(err.message).toBe(
                                    `[Model Manager] - Duplicated fixture id: ${docId}`
                                )
                            
                                return
                            }
                
                            assert.fail('This line should not be reached')
                        }
                    })
                })

                /**
                 * ✅ Test suite for success scenarios
                 * @description Tests successful execution of globFixtures method
                 */
                describe('[SUCCESS]', () => {
                    /**
                     * 🔧 Test setup variables
                     * @type {sinon.SinonSpy} globSpy - Spy for glob.sync method
                     * @type {string} expression - Glob expression for fixtures
                     */
                    let globSpy: sinon.SinonSpy
                    const expression = `${process.cwd()}/test/fixtures/test/**/*.mjs`

                    /**
                     * 🔄 Before each test setup
                     * @description Sets up spy for glob.sync method
                     */
                    beforeEach(() => {
                        globSpy = sinon.spy(glob, 'sync')
                    })

                    /**
                     * 🧪 Test case: Globbing and loading fixtures
                     * @description Verifies that fixtures are correctly globbed and loaded
                     */
                    it('should glob and load fixtures from the file system', async() => {
                        const globbedFixtures = await fixturesManager['globFixtures'](expression)
                        expect(globSpy.calledOnceWithExactly(expression)).toBe(true)

                        // Our fixtures is using BigInt so we can not use JSON.stringify()
                        expect(
                            globbedFixtures[dbName][collectionName].name
                        ).toEqual(
                            fixtures[dbName][collectionName].name
                        )

                        expect(
                            globbedFixtures[dbName][collectionName].docContents
                        ).toEqual(
                            fixtures[dbName][collectionName].docContents
                        )
                    })
                })
            })
        })

        /**
         * 🔓 Test suite for public methods
         * @description Tests the public interface of FixturesManager
        */
        describe('[PUBLIC]', () => {
            /**
             * ➕ Test suite for insert method
             * @description Tests the fixture insertion process
             */
            describe('insert()', () => {
                /**
                 * ❌ Test suite for error scenarios
                 * @description Tests error handling in insert method
                 */
                describe('[ERROR]', () => {
                    /**
                     * 🧪 Test case: Handling already inserted fixtures
                     * @description Verifies that an error is thrown for already inserted fixtures
                     */
                    it('should throw an error if the fixture is already inserted', async() => {
                        const expectedDoc = {
                            name: fixturesDoc.name,
                            docContents: fixturesDoc.docContents,
                            Model: memoryModelDetails.Model
                        } 

                        // Insert the fixture first
                        fixturesManager.fixtures[dbName][collectionName][docId] = expectedDoc

                        try {
                            await fixturesManager.insert([docId])
                            assert.fail('This line should not be reached')
                        } catch (err) {
                            if (err instanceof ValidationError) {
                                expect(err.message).toBe(
                                    `[Model Manager] - Fixture already inserted: ${docId}`
                                )
                                expect(err.data).toEqual({
                                    fixture: expectedDoc,
                                    id: docId,
                                    dbName, collectionName
                                })

                                return
                            }

                            assert.fail('This line should not be reached')
                        }
                    })

                    /**
                     * 🧪 Test case: Handling non-existent fixtures
                     * @description Verifies that an error is thrown for non-existent fixtures
                     */
                    it('should throw an error if the fixture id is not found', async() => {
                        const sampleFixtureId = 'notFound'

                        try {
                            await fixturesManager.insert([sampleFixtureId])
                            assert.fail('This line should not be reached')
                        } catch (err) {
                            if (err instanceof ResourceNotFoundError) {
                                expect(err.message).toBe(
                                    '[Model Manager] - No fixtures inserted.'
                                )
                                expect(err.data).toEqual({
                                    ids: [sampleFixtureId]
                                })

                                return
                            }

                            assert.fail('This line should not be reached')
                        }
                    })
                })

                /**
                 * ✅ Test suite for success scenarios
                 * @description Tests successful execution of insert method
                 */
                describe('[SUCCESS]', () => {
                    /**
                     * 🔧 Test setup variables
                     * @type {sinon.SinonStub} getModelStub - Stub for getModel method
                     * @type {sinon.SinonStub} createMemoryModelStub - Stub for createMemoryModel method
                     * @type {sinon.SinonStub} modelCreateStub - Stub for model creation
                     * @type {Record<string, any>} expectedDoc - Expected document structure
                     * @type {sinon.SinonStub} findOneStub - Stub for findOne method
                     * @type {sinon.SinonStub} leanStub - Stub for lean method
                     * @type {sinon.SinonStub} toObjectStub - Stub for toObject method
                     */
                    let getModelStub: sinon.SinonStub
                    let createMemoryModelStub: sinon.SinonStub
                    let modelCreateStub: sinon.SinonStub
                    let expectedDoc: Record<string, any>
                    let findOneStub: sinon.SinonStub
                    let leanStub: sinon.SinonStub
                    let toObjectStub: sinon.SinonStub

                    /**
                     * 📊 Expected results
                     * @type {Object} expecteddocLean - Expected lean document
                     * @type {Object} expectedToObjectDoc - Expected toObject document
                     */
                    const expecteddocLean = { lean: true }
                    const expectedToObjectDoc = { toObject: true }

                    /**
                     * 🔄 Before each test setup
                     * @description Sets up stubs and mocks for each test
                     */
                    beforeEach(() => {
                        getModelStub = sinon.stub()
                        fixturesManager['modelManager'] = {
                            getModel: getModelStub.returns(modelDetails)
                        } as unknown as ModelManager

                        createMemoryModelStub = sinon.stub(
                            ModelUtils, 'createMemoryModel'
                        ).resolves(memoryModelDetails)

                        modelCreateStub = sinon.stub(
                            memoryModelDetails.Model, 'create'
                        ).resolves()

                        // ==== Model.findOne() ====
                        findOneStub = sinon.stub(memoryModelDetails.Model, 'findOne')

                        leanStub = sinon.stub().returns(expecteddocLean)

                        findOneStub.withArgs({ _id: docId }).onFirstCall().returns({
                            lean: leanStub
                        })

                        toObjectStub = sinon.stub().returns(expectedToObjectDoc)
            
                        expectedDoc = {
                            normalDoc: true,
                            toObject: toObjectStub
                        }

                        findOneStub.withArgs({ _id: docId }).onSecondCall().resolves(expectedDoc)
                    })

                    /**
                     * 🧪 Test suite for single fixture insertion
                     * @description Tests the insertion of a single fixture
                     */
                    describe('[SINGLE FIXTURE]', () => {
                        /**
                         * 🧪 Test case: Inserting a specific fixture
                         * @description Verifies that a single fixture is correctly inserted
                         */
                        it('should insert specific fixture into the specified collections', async() => {
                            const result = await fixturesManager.insert([docId])

                            // ==== SPIES/STUBS ====
                            expect(getModelStub.calledOnceWithExactly(collectionName)).toBe(true)

                            expect(createMemoryModelStub.calledOnceWithExactly({
                                dbName,
                                modelName: collectionName,
                                schema: modelDetails.schema
                            })).toBe(true)

                            expect(modelCreateStub.calledOnceWithExactly(fixturesDoc.docContents)).toBe(true)

                            expect(leanStub.calledOnce).toBe(true)
                            expect(findOneStub.calledTwice).toBe(true)

                            expect(toObjectStub.calledOnce).toBe(true)

                            // ==== EXPECTATIONS ====
                            expect(result[docId].doc).toEqual(expectedDoc)
                            expect(result[docId].docContents).toEqual(fixturesDoc.docContents)
                            expect(result[docId].docLean).toEqual(expecteddocLean)
                            expect(result[docId].Model).toEqual(memoryModelDetails.Model)
                            expect(result[docId].mongoServer).toEqual(memoryModelDetails.mongoServer)
                            expect(result[docId].name).toEqual(fixturesDoc.name)
                            expect(result[docId].docToObject).toEqual(expectedToObjectDoc)
                        })
                    })

                    /**
                     * 🧪 Test suite for multiple fixture insertion
                     * @description Tests the insertion of multiple fixtures
                     */
                    describe('[MULTIPLE FIXTURES]', () => {
                        /**
                         * 🔄 Before each test setup
                         * @description Sets up additional stubs for multiple fixture tests
                         */
                        beforeEach(() => {
                            findOneStub.withArgs({ _id: docId2 }).onFirstCall().returns({
                                lean: leanStub
                            })

                            findOneStub.withArgs({ _id: docId2 }).onSecondCall().resolves(expectedDoc)
                        })

                        /**
                         * 🧪 Test case: Inserting multiple fixtures
                         * @description Verifies that multiple fixtures are correctly inserted
                         */
                        it('should insert multiple fixtures into the specified collections', async() => {
                            const result = await fixturesManager.insert([docId, docId2])

                            // ==== SPIES/STUBS ====
                            expect(getModelStub.calledTwice).toBe(true)
                            expect(createMemoryModelStub.calledTwice).toBe(true)

                            expect(modelCreateStub.firstCall.calledWithExactly(fixturesDoc.docContents)).toBe(true)
                            expect(modelCreateStub.secondCall.calledWithExactly(fixturesDoc2.docContents)).toBe(true)

                            expect(leanStub.calledTwice).toBe(true)
                            expect(findOneStub.callCount).toBe(4)
                            expect(toObjectStub.calledTwice).toBe(true)

                            // ==== EXPECTATIONS ====
                            expect(result[docId].name).toEqual(fixturesDoc.name)
                            expect(result[docId2].name).toEqual(fixturesDoc2.name)
                        })
                    })
                })
            })

            /**
             * 🔍 Test suite for getFixture method
             * @description Tests the fixture retrieval process
             */
            describe('getFixture()', () => {
                /**
                 * ❌ Test suite for error scenarios
                 * @description Tests error handling in getFixture method
                 */
                describe('[ERROR]', () => {
                    /**
                     * 🧪 Test case: Handling non-existent fixtures
                     * @description Verifies that an error is thrown for non-existent fixtures
                     */
                    it('should throw an error if the fixture is not found', () => {
                        const sampleFixtureId = 'notFound'

                        try {
                            fixturesManager.getFixture(sampleFixtureId)
                            assert.fail('This line should not be reached')
                        } catch (err) {
                            if (err instanceof ResourceNotFoundError) {
                                expect(err.message).toBe(
                                    `[Model Manager] - Fixture not found: ${sampleFixtureId}`
                                )
                                expect(err.data).toEqual({
                                    id: sampleFixtureId
                                })

                                return
                            }

                            assert.fail('This line should not be reached')
                        }
                    })
                })

                /**
                 * ✅ Test suite for success scenarios
                 * @description Tests successful execution of getFixture method
                 */
                describe('[SUCCESS]', () => {
                    /**
                     * 🧪 Test case: Retrieving an existing fixture
                     * @description Verifies that an existing fixture is correctly retrieved
                     */
                    it('should return the fixture object', () => {
                        const fixture = fixturesManager.getFixture(docId)
                        expect(fixture).toEqual(fixturesDoc)
                    })
                })
            })

            /**
             * 🧹 Test suite for cleaning operations
             * @description This describe block contains tests for cleaning fixtures
             */
            describe('[CLEANING]', () => {
                /**
                 * 🔧 Stub for MongoDB server operations
                 * @type {sinon.SinonStub}
                 */
                let mongoServerStub: sinon.SinonStub

                /**
                 * 🕵️ Spy for Promise.all method
                 * @type {sinon.SinonSpy}
                 */
                let promiseAllSpy: sinon.SinonSpy

                /**
                 * 🔄 Setup before each test
                 * @description Initializes stubs and spies, and sets up mock MongoDB servers for fixtures
                 */
                beforeEach(() => {
                    promiseAllSpy = sinon.spy(Promise, 'all')
                    mongoServerStub = sinon.stub()

                    Reflect.set(fixturesManager.fixtures[dbName][collectionName][docId], 'mongoServer', {
                        stop: mongoServerStub
                    })

                    Reflect.set(fixturesManager.fixtures[dbName][collectionName][docId2], 'mongoServer', {
                        stop: mongoServerStub
                    })
                })

                /**
                 * 🧼 Test suite for the clean() method
                 * @description Contains tests for cleaning specific fixtures
                 */
                describe('clean()', () => {
                    /**
                     * 🎯 Test suite for cleaning a specific fixture
                     * @description Tests the removal of a single, specific fixture
                     */
                    describe('[SPECIFIC FIXTURE]', () => {
                        /**
                         * ✅ Test case: Cleaning up a specific fixture
                         * @description Verifies that a single fixture is removed correctly
                         * @returns {Promise<void>}
                         */
                        it('should clean up specific fixture', async() => {
                            expect(fixturesManager.fixtures[dbName][collectionName][docId]).toEqual(fixturesDoc)
                            expect(fixturesManager.fixtures[dbName][collectionName][docId2]).toEqual(fixturesDoc2)

                            await fixturesManager.clean([docId])

                            expect(fixturesManager.fixtures[dbName][collectionName][docId]).toEqual(undefined)
                            expect(fixturesManager.fixtures[dbName][collectionName][docId2]).toEqual(fixturesDoc2)

                            expect(mongoServerStub.calledOnce).toBe(true)
                            expect(promiseAllSpy.calledOnce).toBe(true)
                        })
                    })

                    /**
                     * 🔢 Test suite for cleaning multiple fixtures
                     * @description Tests the removal of multiple fixtures simultaneously
                     */
                    describe('[MULTIPLE FIXTURES]', () => {
                        /**
                         * ✅ Test case: Cleaning up multiple fixtures
                         * @description Verifies that multiple fixtures are removed correctly
                         * @returns {Promise<void>}
                         */
                        it('should clean up multiple fixtures', async() => {
                            expect(fixturesManager.fixtures[dbName][collectionName][docId]).toEqual(fixturesDoc)
                            expect(fixturesManager.fixtures[dbName][collectionName][docId2]).toEqual(fixturesDoc2)

                            await fixturesManager.clean([docId, docId2])

                            expect(fixturesManager.fixtures[dbName][collectionName][docId]).toEqual(undefined)
                            expect(fixturesManager.fixtures[dbName][collectionName][docId2]).toEqual(undefined)

                            expect(mongoServerStub.calledTwice).toBe(true)
                            expect(promiseAllSpy.calledOnce).toBe(true)
                        })
                    })
                })

                /**
                 * 🧹 Test suite for the cleanAll() method
                 * @description Contains tests for cleaning all fixtures
                 */
                describe('cleanAll()', () => {
                    /**
                     * ✅ Test case: Cleaning up all fixtures
                     * @description Verifies that all fixtures are removed and the fixtures object is reset
                     * @returns {Promise<void>}
                     */
                    it('should clean up all the fixtures and restore this.fixturees', async() => {
                        expect(fixturesManager.fixtures[dbName][collectionName][docId]).toEqual(fixturesDoc)
                        expect(fixturesManager.fixtures[dbName][collectionName][docId2]).toEqual(fixturesDoc2)

                        await fixturesManager.cleanAll()

                        expect(fixturesManager.fixtures).toEqual({})

                        expect(mongoServerStub.calledTwice).toBe(true)
                        expect(promiseAllSpy.calledOnce).toBe(true)
                    })
                })
            })
        })
    })
})