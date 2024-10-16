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

// ==== INTERNAL DEPENDENCIES ====
import ModelManager, { type IModel } from '@/src/ModelManager'
import ModelUtils, { type IMemoryModel } from '@/src/ModelUtils'

// ==== CODE TO TEST ====
import FixturesManager, {
    type IFixtureDoc, type IFixtures
} from '@/src/FixturesManager'

describe('[UNIT TEST] - src/FixtureManager.ts', () => {
    let fixturesManager: FixturesManager
    let initStub: sinon.SinonStub

    let fixtures: IFixtures<IFixtureDoc>
    let fixturesDoc: IFixtureDoc
    let fixturesDoc2: IFixtureDoc
    let docId: string
    let docId2: string

    let modelDetails: IModel<any>
    let memoryModelDetails: IMemoryModel<any>

    const dbName = 'test'
    const collectionName = 'test.Test'

    beforeAll(async() => {
        modelDetails = globalThis.modelDetails
        memoryModelDetails = globalThis.memoryModelDetails

        fixturesDoc = await import('@/test/fixtures/test/test.Test/0_test') as IFixtureDoc
        fixturesDoc2 = await import('@/test/fixtures/test/test.Test/1_test') as IFixtureDoc
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

    beforeEach(async() => {
        initStub = sinon.stub(
            FixturesManager.prototype, 'init' as keyof FixturesManager
        ).resolves()

        // Reset instance before creating a new one
        Reflect.set(FixturesManager, 'instance', undefined)
        fixturesManager = await FixturesManager.getInstance()
        fixturesManager.fixtures = _.cloneDeep(fixtures)
    })

    afterEach(async() => {
        await fixturesManager.cleanAll()
        sinon.restore()
    })

    describe('getInstance()', () => {
        it('should create new instance', () => {
            expect(initStub.calledOnce).toBe(true)
            expect(fixturesManager).toBeInstanceOf(FixturesManager)
            expect(fixturesManager.fixtures).toEqual(fixtures)
        })

        it('should return existing instance', async() => {
            const fixturesManager2 = await FixturesManager.getInstance()
            expect(initStub.calledOnce).toBe(true)
            expect(fixturesManager2.fixtures).toEqual(fixtures)
            expect(fixturesManager2).toBeInstanceOf(FixturesManager)
        })
    })

    describe('[METHODS]', () => {
        describe('[PRIVATE]', () => {
            describe('init()', () => {
                let globFixturesStub: sinon.SinonStub
                let getInstanceStub: sinon.SinonStub

                beforeEach(() => {
                    initStub.restore()

                    globFixturesStub = sinon.stub(
                        FixturesManager.prototype, 'globFixtures' as keyof FixturesManager
                    ).resolves({})

                    getInstanceStub = sinon.stub(
                        ModelManager, 'getInstance'
                    ).resolves()
                })


                it('should initialize fixtures if not already initialized', async() => {
                    fixturesManager.fixtures = {}

                    await fixturesManager['init']()

                    // ==== SPIES/STUBS ====
                    expect(getInstanceStub.calledOnce).toBe(true)
                    expect(
                        globFixturesStub.calledOnceWithExactly(`${process.cwd()}/test/fixtures/**/*.ts`)
                    ).toBe(true)

                    // ==== EXPECTATIONS ====
                    expect(fixturesManager.fixtures).toEqual({})
                })

                it('should not initialize fixtures if already initialized', async() => {
                    await fixturesManager['init']()
                    
                    // ==== SPIES/STUBS ====
                    expect(globFixturesStub.called).toBe(false)

                    // ==== EXPECTATIONS ====
                    expect(fixturesManager.fixtures).toEqual(fixtures)
                })
            })

            describe('globFixtures()', () => {
                describe('[ERROR]', () => {
                    let fixturesDocDuplicated: IFixtureDoc

                    beforeAll(async() => {
                        fixturesDocDuplicated = await import(
                            '@/test/fixtures/error/duplicated/0_test'
                        ) as IFixtureDoc
                    })

                    it('should throw an error if there are duplicate fixture ids', async() => {
                        const expression = `${process.cwd()}/test/fixtures/error/**/*.ts`
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

                describe('[SUCCESS]', () => {
                    let globSpy: sinon.SinonSpy
                    const expression = `${process.cwd()}/test/fixtures/test/**/*.ts`

                    beforeEach(() => {
                        globSpy = sinon.spy(glob, 'sync')
                    })

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

        describe('[PUBLIC]', () => {
            describe('insert()', () => {
                describe('[ERROR]', () => {
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

                describe('[SUCCESS]', () => {
                    let getModelStub: sinon.SinonStub

                    let createMemoryModelStub: sinon.SinonStub
                    let modelCreateStub: sinon.SinonStub

                    let expectedDoc: Record<string, any>

                    let findOneStub: sinon.SinonStub
                    let leanStub: sinon.SinonStub
                    let toObjectStub: sinon.SinonStub

                    const expecteddocLean = { lean: true }
                    const expectedToObjectDoc = { toObject: true }

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

                    it('should insert documents into the specified collections', async() => {
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
            })

            describe('getFixture()', () => {
                describe('[ERROR]', () => {
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

                describe('[SUCCESS]', () => {
                    it('should return the fixture object', () => {
                        const fixture = fixturesManager.getFixture(docId)
                        expect(fixture).toEqual(fixturesDoc)
                    })
                })
            })

            describe('[CLEANING]', () => {
                let mongoServerStub: sinon.SinonStub
                let promiseAllSpy: sinon.SinonSpy

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

                describe('clean()', () => {
                    it('should clean up specific fixture', async() => {
                        // Check if the fixture is there
                        expect(fixturesManager.fixtures[dbName][collectionName][docId]).toEqual(fixturesDoc)
                        expect(fixturesManager.fixtures[dbName][collectionName][docId2]).toEqual(fixturesDoc2)

                        await fixturesManager.clean([docId])

                        // ==== EXPECTATIONS ====
                        // Check if the specified fixture is removed
                        expect(fixturesManager.fixtures[dbName][collectionName][docId]).toEqual(undefined)
                        // Check if second fixture is still there
                        expect(fixturesManager.fixtures[dbName][collectionName][docId2]).toEqual(fixturesDoc2)

                        // ==== SPIES/STUBS ====
                        expect(mongoServerStub.calledOnce).toBe(true)
                        expect(promiseAllSpy.calledOnce).toBe(true)
                    })
                })

                describe('cleanAll()', () => {
                    it('should clean up all the fixtures and restore this.fixturees', async() => {
                        // Check if the fixture is there
                        expect(fixturesManager.fixtures[dbName][collectionName][docId]).toEqual(fixturesDoc)
                        expect(fixturesManager.fixtures[dbName][collectionName][docId2]).toEqual(fixturesDoc2)

                        await fixturesManager.cleanAll()
  
                        // ==== EXPECTATIONS ====
                        // Check if the specified fixture is removed
                        expect(fixturesManager.fixtures).toEqual({})

                        // ==== SPIES/STUBS ====
                        expect(mongoServerStub.calledTwice).toBe(true)
                        expect(promiseAllSpy.calledOnce).toBe(true)
                    })
                })
            })
        })
    })
})