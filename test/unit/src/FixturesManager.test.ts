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
import { glob } from 'glob'
import { ValidationError } from 'error-manager-helper'
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
import FixturesManager, { type IFixtureDoc, type IFixtures} from '@/src/FixturesManager'

describe('[UNIT TEST] - src/FixtureManager.ts', () => {
    let fixturesManager: FixturesManager
    let initStub: sinon.SinonStub

    let fixtures: IFixtures<IFixtureDoc>
    let fixturesDoc: IFixtureDoc
    let docId: string

    let modelDetails: IModel<any>
    let memoryModelDetails: IMemoryModel<any>

    const sampleFixtureId = '000000000000000000000002'
    const dbName = 'test'
    const collectionName = 'test.Test'

    beforeAll(async() => {
        modelDetails = globalThis.modelDetails
        memoryModelDetails = globalThis.memoryModelDetails

        fixturesDoc = await import('@/test/fixtures/test/test.Test/0_test') as IFixtureDoc
        docId = fixturesDoc.docContents._id.toString()

        fixtures = {
            [dbName]: {
                [collectionName]: {
                    [docId]: fixturesDoc
                }
            }
        }
    })

    beforeEach(async() => {
        // Reset instance before creating a new one
        Reflect.set(FixturesManager, 'instance', undefined)

        initStub = sinon.stub(
            FixturesManager.prototype, 'init' as keyof FixturesManager
        ).resolves()

        fixturesManager = await FixturesManager.getInstance()
    })

    afterEach(async() => {
        await fixturesManager.cleanAll()
        initStub.restore()
    })

    describe('getInstance()', () => {
        it('should create new instance', () => {
            expect(initStub.calledOnce).toBe(true)
            expect(fixturesManager).toBeInstanceOf(FixturesManager)
            expect(fixturesManager.fixtures).toEqual({})
        })

        it('should return existing instance', async() => {
            const fixturesManager2 = await FixturesManager.getInstance()
            expect(initStub.calledOnce).toBe(true)
            expect(fixturesManager2.fixtures).toEqual([])
            expect(fixturesManager2).toBeInstanceOf(FixturesManager)
        })
    })

    describe('[METHODS]', () => {
        describe('[PRIVATE]', () => {
            describe('init()', () => {
                let globFixturesStub: sinon.SinonStub
                let getInstanceStub: sinon.SinonStub

                beforeEach(() => {
                    // In order to call init method, we need to restore the stub
                    initStub.restore()

                    globFixturesStub = sinon.stub(
                        FixturesManager.prototype, 'globFixtures' as keyof FixturesManager
                    ).resolves({})

                    getInstanceStub = sinon.stub(
                        ModelManager, 'getInstance'
                    ).resolves()
                })

                afterEach(() => {
                    globFixturesStub.restore()
                    getInstanceStub.restore()
                })

                it('should initialize modelmanager instance', async() => {
                    await fixturesManager['init']()
                    expect(getInstanceStub.calledOnce).toBe(true)
                })
            
                it('should initialize fixtures if not already initialized', async() => {
                    await fixturesManager['init']()

                    expect(fixturesManager.fixtures).toEqual({})
                    expect(
                        globFixturesStub.calledOnceWithExactly(`${process.cwd()}/test/fixtures/**/*.ts`)
                    ).toBe(true)
                })

                it('should not initialize fixtures if already initialized', async() => {
                    fixturesManager.fixtures = fixtures

                    await fixturesManager['init']()
                    
                    expect(globFixturesStub.called).toBe(false)
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
                                const typedErr = err
                
                                expect(typedErr.message).toBe(
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

                    afterEach(() => {
                        globSpy.restore()
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
                })
                describe('[SUCCESS]', () => {
                    let getModelStub: sinon.SinonStub
                    let createMemoryModelStub: sinon.SinonStub
                    let modelCreateStub: sinon.SinonStub

                    let expectedDoc: Record<string, any>

                    let modelFindOneStub: sinon.SinonStub
                    let findOneStub: sinon.SinonStub
                    let leanStub: sinon.SinonStub
                    let toObjectStub: sinon.SinonStub

                    const expecteddocLean = { lean: true }
                    const expectedToObjectDoc = { toObject: true }

                    beforeEach(() => {
                        fixturesManager.fixtures = fixtures

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

                    afterEach(() => {
                        getModelStub.restore()
                        createMemoryModelStub.restore()
                        modelCreateStub.restore()

                        modelFindOneStub.restore()
                        findOneStub.restore()
                        leanStub.restore()
                        toObjectStub.restore()
                    })

                    it.only('should insert documents into the specified collections', async() => {
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

            describe('cleanAll()', () => {
                let mongoServerSpy: sinon.SinonSpy

                beforeEach(async() => {
                    // Create some fixtures
                    await fixturesManager.insert([sampleFixtureId])
 
                    const { mongoServer } = fixturesManager.getFixture(sampleFixtureId)!
 
                    mongoServerSpy = sinon.spy(mongoServer, 'stop')
                })

                it('should clean up all the fixtures', async() => {
                    const docId = docId

                    expect(
                        (fixturesManager as any).fixtures['test']['test.Test'][docId].doc._id.toString()
                    ).toBe(docId)

                    await fixturesManager.cleanAll()

                    expect(mongoServerSpy.calledOnce).to.be.true
                    expect((fixturesManager as any).fixtures).toEqual({})
                })
            })

            describe('getFixture()', () => {
                beforeEach(async() => {
                    await fixturesManager.insert([sampleFixtureId])
                })
                
                it('should return the fixture object', async() => {
                    const fixture = fixturesManager.getFixture(docId)

                    expect(fixture?.doc._id.toString()).toBe(docId)
                    expect(fixture?.Model).to.exist
                    expect(fixture?.mongoServer).to.exist
                })

                it('should return null because fixture not found', async() => {
                    const fixture = fixturesManager.getFixture('notFound')
                    expect(fixture).toBe(null)
                })
            })
        })
    })
})