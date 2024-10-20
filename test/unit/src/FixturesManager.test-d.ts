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
    describe, it,
    expect, expectTypeOf,
    beforeEach
} from 'vitest'

// ==== INTERNAL ====
import type {
    IFixtureDoc, IFixtureInserted,
    IFixture,
    IFixtures
} from '@/src/FixturesManager'

// ==== CODE TO TEST ====
import FixturesManager from '@/src/FixturesManager'


describe('[TYPE TEST] - src/FixturesManager.ts', () => {
    let fixturesManager: FixturesManager

    /**
     * 🛠️ Before each test, reset the instance of `FixturesManager`.
     */
    beforeEach(async() => {
        Reflect.set(FixturesManager, 'instance', undefined)
        fixturesManager = await FixturesManager.getInstance()
        expect(fixturesManager).toBeInstanceOf(FixturesManager)
    })

    describe('[INTERFACES]', () => {
        /**
         * 📝 Represents a fixture document with a name and document contents.
         * @interface IFixtureDoc
         * @property {string} name - The name identifying the fixture.
         * @property {Object} docContents - The contents of the fixture document.
         * @property {mongoose.Types.ObjectId} docContents._id - Unique Mongoose ObjectId for the document.
         * @property {string} docContents.name - Name field of the fixture document.
         * @property {Record<string, any>} [docContents.key] - Additional dynamic properties of the document.
         */
        interface IFixtureDoc_Test {
            name: string
            docContents: {
                _id: mongoose.Types.ObjectId;
                name: string;
                [key: string]: any;
            }
        }

        /**
         * 📦 Represents an inserted fixture containing both the original document
         * and its lean (plain object) version, along with the Mongoose model reference.
         * 
         * @interface IFixtureInserted
         * @property {(mongoose.Document<unknown> & Required<{ _id: unknown }>) | null} doc - 
         *    The inserted Mongoose document instance, or null if not available.
         * @property {(mongoose.FlattenMaps<unknown> & Required<{ _id: unknown }>) | null} docLean - 
         *    The lean version of the inserted document, or null if not available.
         * @property {{ [x: string]: any } & Required<{ _id: unknown }> | undefined} docToObject - 
         *    Plain JavaScript object representation of the inserted document.
         * @property {mongoose.Model<any>} Model - Reference to the Mongoose model used for the insertion.
         * @property {MongoMemoryServer} mongoServer - Instance of the in-memory MongoDB server used.
         */
        interface IFixtureInserted_Test {
            doc: (mongoose.Document<unknown> & Required<{ _id: unknown; }>) | null
            docLean: (mongoose.FlattenMaps<unknown> & Required<{ _id: unknown; }>) | null
            docToObject: ({ [x: string]: any; } & Required<{ _id: unknown; }>) | undefined
            Model: mongoose.Model<any>
            mongoServer: MongoMemoryServer
        }

        /**
         * 🔗 Combines both the original fixture document and the inserted fixture information.
         * 
         * @typedef {IFixtureDoc & IFixtureInserted} IFixture
         */
        type IFixture_Test = IFixtureDoc_Test & IFixtureInserted_Test

        /**
         * 🏗️ Represents the entire structure of test fixtures loaded from files.
         * The structure is nested as: database name -> collection name -> fixture ID.
         * 
         * Once fixtures are inserted, they are extended with `IFixtureInserted` data.
         * 
         * @template T - Type of the fixture, either a document or an inserted object.
         * @interface IFixtures
         * @property {Record<string, Record<string, Record<string, T>>>} fixtures - 
         *    The fixture hierarchy indexed by database name -> collection name -> fixture ID.
         */
        interface IFixtures_Test<T> {
            [dbName: string]: {
                [collectionName: string]: {
                    [id: string]: T
                }
            }
        }

        describe('IFixtureDoc_Test', () => {
            /**
             * 🧪 Validates if `IFixtureDoc` type matches `IFixtureDoc_Test`.
             */
            it('should verify type', () => {
                expectTypeOf<IFixtureDoc>().toEqualTypeOf<IFixtureDoc_Test>()
            })
        })

        describe('IFixtureInserted_Test', () => {
            /**
             * 🧪 Validates if `IFixtureInserted` type matches `IFixtureInserted_Test`.
             */
            it('should verify type', () => {
                expectTypeOf<IFixtureInserted>().toEqualTypeOf<IFixtureInserted_Test>()
            })
        })

        describe('IFixture_Test', () => {
            /**
             * 🧪 Validates if `IFixture` type matches `IFixture_Test`.
             */
            it('should verify type', () => {
                expectTypeOf<IFixture>().toEqualTypeOf<IFixture_Test>()
            })
        })

        describe('IFixtures_Test', () => {
            /**
             * 🧪 Validates if `IFixtures` type matches `IFixtures_Test`.
             */
            it('should verify type', () => {
                expectTypeOf<IFixtures<IFixture>>().toEqualTypeOf<IFixtures_Test<IFixture_Test>>()
            })
        })
    })

    describe('getInstance()', () => {
        /**
         * 🧪 Validates the parameter and return type of `getInstance()` method.
         */
        it('should verify param and return type', () => {
            expectTypeOf(fixturesManager).toEqualTypeOf<FixturesManager>()
            expectTypeOf(
                FixturesManager.getInstance.bind(fixturesManager)
            ).returns.resolves.toEqualTypeOf<FixturesManager>()
        })
    })

    describe('[METHODS]', () => {
        describe('[PRIVATE]', () => {
            describe('init()', () => {
                /**
                 * 🧪 Validates the return type of `init()` method.
                 */
                it('should verify return type', () => {
                    expectTypeOf(fixturesManager['init']).returns.resolves.toBeVoid()
                })
            })

            describe('globFixtures()', () => {
                /**
                 * 🧪 Validates the parameter and return type of `globFixtures()` method.
                 */
                it('should verify param & return type', () => {
                    expectTypeOf(fixturesManager['globFixtures']).parameter(0).toBeString()
                    expectTypeOf(fixturesManager['globFixtures']).returns.resolves
                        .toEqualTypeOf<IFixtures<IFixtureDoc>>()
                })
            })
        })

        describe('[PUBLIC]', () => {
            describe('insert()', () => {
                /**
                 * 🧪 Validates the parameter and return type of `insert()` method.
                 */
                it('should verify param & return type', () => {
                    expectTypeOf(fixturesManager['insert']).parameter(0).toEqualTypeOf<string[]>()
                    expectTypeOf(fixturesManager['insert']).returns.resolves
                        .toEqualTypeOf<{ [id: string]: IFixture }>()
                })
            })

            describe('getFixture()', () => {
                /**
                 * 🧪 Validates the parameter and return type of `getFixture()` method.
                 */
                it('should verify param & return type', () => {
                    expectTypeOf(fixturesManager['getFixture']).parameter(0).toBeString()
                    expectTypeOf(fixturesManager['getFixture']).returns
                        .toEqualTypeOf<IFixtureDoc | IFixtureInserted>()
                })
            })

            describe('clean()', () => {
                /**
                 * 🧪 Validates the parameter and return type of `clean()` method.
                 */
                it('should verify param & return type', () => {
                    expectTypeOf(fixturesManager['clean']).parameter(0).toEqualTypeOf<string[]>()
                    expectTypeOf(fixturesManager['clean']).returns.resolves
                        .toBeVoid()
                })
            })

            describe('cleanAll()', () => {
                /**
                 * 🧪 Validates the return type of `cleanAll()` method.
                 */
                it('should verify param & return type', () => {
                    expectTypeOf(fixturesManager['cleanAll']).returns.resolves
                        .toBeVoid()
                })
            })
        })
    })
})
