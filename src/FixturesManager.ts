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
import _ from 'lodash'
import path from 'path'
import { glob } from 'glob'
import mongoose from 'mongoose'
import { ValidationError, ResourceNotFoundError } from 'error-manager-helper'
import { MongoMemoryServer } from 'mongodb-memory-server'

// ==== INTERNAL DEPENDENCIES ====
import ModelUtils from './ModelUtils'
import ModelManager from './ModelManager'

/**
 * 📝 Represents a fixture document with a name and document contents.
 * @interface IFixtureDoc
 * @property {string} name - The name identifying the fixture.
 * @property {Object} docContents - The contents of the fixture document.
 * @property {mongoose.Types.ObjectId} docContents._id - Unique Mongoose ObjectId for the document.
 * @property {string} docContents.name - Name field of the fixture document.
 * @property {Record<string, any>} [docContents.key] - Additional dynamic properties of the document.
 */
export interface IFixtureDoc {
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
 * @interface IFixtureInserted
 * 
 * @template TSchema - The type of the document schema used by the model.
 * 
 * @property {(mongoose.Document<TSchema> & Required<{ _id: unknown }>} doc
 * - The inserted Mongoose document instance
 * 
 * @property {(mongoose.FlattenMaps<TSchema> & Required<{ _id: unknown }>} docLean
 * - The lean version of the inserted document
 * 
 * @property {{ [x: string]: any } & Required<{ _id: unknown }>} docToObject
 * - Plain JavaScript object representation of the inserted document.
 * 
 * @property {mongoose.Model<any>} Model - Reference to the Mongoose model used for the insertion.
 * @property {MongoMemoryServer} mongoServer - Instance of the in-memory MongoDB server used.
 */
export interface IFixtureInserted<TSchema = any> {
    doc: (mongoose.Document<TSchema> & Required<{ _id: unknown; }>)
    docLean: (mongoose.FlattenMaps<TSchema> & Required<{ _id: unknown; }>)
    docToObject: (TSchema & Required<{ _id: unknown; }>)
    Model: mongoose.Model<any>
    mongoServer: MongoMemoryServer
}

/**
 * 🔗 Combines both the original fixture document and the inserted fixture information.
 * @typedef {IFixtureDoc & IFixtureInserted} IFixture
 */
export type IFixture = IFixtureDoc & IFixtureInserted

/**
 * 🏗️ Represents the entire structure of test fixtures loaded from files.
 * The structure is nested as: database name -> collection name -> fixture ID.
 * 
 * Once fixtures are inserted, they are extended with `IFixtureInserted` data.
 * @template T - Type of the fixture, either a document or an inserted object.
 * @interface IFixtures
 * @property {Record<string, Record<string, Record<string, T>>>} fixtures - 
 *    The fixture hierarchy indexed by database name -> collection name -> fixture ID.
 */
export interface IFixtures<T> {
    [dbName: string]: {
        [collectionName: string]: {
            [id: string]: T
        }
    }
}

/**
 * 🛠️ Manages test fixtures for MongoDB memory server and Mongoose models.
 * Implements the Singleton pattern to ensure a single instance.
 * @class FixturesManager
 */
class FixturesManager {
    // eslint-disable-next-line no-use-before-define
    private static instance: FixturesManager
    private modelManager!: ModelManager
    public fixtures: IFixtures<IFixtureInserted | IFixtureDoc> = {}

    /**
     * 🔒 Private constructor to enforce Singleton pattern.
     * Use `getInstance()` to access the FixturesManager instance.
     * @private
     */
    private constructor() {}

    /**
     * 🌐 Retrieves the singleton instance of FixturesManager.
     * Initializes the instance on first access.
     * @static
     * @async
     * @returns {Promise<FixturesManager>} Singleton instance of FixturesManager.
     */
    public static async getInstance(): Promise<FixturesManager> {
        if (!this.instance) {
            this.instance = new FixturesManager()
            await this.instance.init()
        }

        return this.instance
    }

    /**
     * ⚙️ Initializes the FixturesManager by loading fixtures and models.
     * @private
     * @async
     * @returns {Promise<void>} Resolves when initialization is complete.
     */
    private async init(): Promise<void> {
        if (_.isEmpty(this.fixtures)) {
            const expression = `${process.cwd()}/test/fixtures/**/*.mjs`
            this.fixtures = await this.globFixtures(expression)
        }

        // Load models using ModelManager
        this.modelManager = await ModelManager.getInstance()
    }

    /**
     * 📂 Loads fixture files matching the given glob pattern.
     * Organizes them by database and collection names.
     * @private
     * @async
     * @param {string} expression - Glob pattern to match fixture files.
     * @returns {Promise<IFixtures<IFixtureDoc>>} The loaded fixture documents.
     * @throws {ValidationError} If duplicate fixture IDs are found.
     */
    private async globFixtures(
        expression: string
    ): Promise<IFixtures<IFixtureDoc>> {
        const filePaths = glob.sync(expression)
        const fixtures: IFixtures<IFixtureDoc> = {}

        for (const filePath of filePaths) {
            const [dbName, collectionName] = filePath.split(path.sep).slice(-3, -1)
            const { docContents, name } = await import(/* webpackIgnore: true */ filePath) as IFixtureDoc
            const id = docContents._id.toString()

            // Ensure the fixture structure is initialized
            fixtures[dbName] ??= {}
            fixtures[dbName][collectionName] ??= {}

            // Check for duplicate fixtures by ID
            if (fixtures[dbName][collectionName][id]) {
                throw new ValidationError(`[Model Manager] - Duplicated fixture id: ${id}`, {
                    docContents, dbName, collectionName
                })
            }

            // Assign the fixture to the structure
            fixtures[dbName][collectionName][id] = {
                docContents, name
            }
        }

        return fixtures
    }

    /**
     * ➕ Inserts specified fixtures into the in-memory MongoDB instance.
     * @async
     * @param {string[]} ids - Array of fixture IDs to insert.
     * @returns {Promise<Record<string, IFixture>>} The inserted fixture data.
     * @throws {ValidationError} If the fixture has already been inserted.
     * @throws {ResourceNotFoundError} If the fixture ID is not found.
     */
    public async insert(
        ids: string[]
    ): Promise<{ [id: string]: IFixture }> {
        const result: { [id: string]: IFixture } = {}

        await Promise.all(ids.map(async id => {
            for (const [dbName, collections] of Object.entries(this.fixtures)) {
                for (const [collectionName, fixtures] of Object.entries(collections)) {
                    const fixture = fixtures[id]

                    if (fixture) {
                        if ('Model' in fixture) {
                            throw new ValidationError(`[Model Manager] - Fixture already inserted: ${id}`, {
                                fixture, id, dbName, collectionName
                            })
                        }

                        if ('docContents' in fixture) {
                            // Retrieve Mongoose model for the collection
                            const { schema } = this.modelManager.getModel(collectionName)

                            // Create the in-memory model and insert the fixture
                            const { Model, mongoServer } = await ModelUtils.createMemoryModel({
                                dbName, modelName: collectionName, schema
                            })

                            // Insert the fixture document data
                            await Model.create(fixture.docContents)

                            // Fetch the document in lean and full forms
                            const docLean = await Model.findOne({ _id: id }).lean()
                            const doc = await Model.findOne({ _id: id })

                            if (!docLean || !doc) {
                                throw new ResourceNotFoundError(`[Model Manager] - Fixture not found: ${id}`, { id })
                            }

                            // Store the processed fixture object
                            const fixtureObject: IFixture = {
                                name: fixture.name,
                                docContents: fixture.docContents,
                                doc,
                                docLean,
                                docToObject: doc.toObject(),
                                Model,
                                mongoServer
                            }

                            this.fixtures[dbName][collectionName][id] = fixtureObject
                            result[id] = fixtureObject
                        }
                    }
                }
            }
        }))

        if (_.isEmpty(result)) {
            throw new ResourceNotFoundError('[Model Manager] - No fixtures inserted.', { ids })
        }

        return result
    }

    /**
     * 🔍 Retrieves the fixture object based on the given ID.
     * @param {string} id - The ID of the fixture to retrieve.
     * @returns {IFixtureDoc | IFixtureInserted} The fixture object.
     * @throws {ResourceNotFoundError} If the fixture ID is not found.
     */
    public getFixture(id: string): IFixtureDoc | IFixtureInserted {
        for (const dbName in this.fixtures) {
            for (const collectionName in this.fixtures[dbName]) {
                const fixture = this.fixtures[dbName][collectionName][id]

                if (fixture) {
                    return fixture
                }
            }
        }

        throw new ResourceNotFoundError(`[Model Manager] - Fixture not found: ${id}`, { id })
    }

    /**
     * 🧹 Cleans up specific fixtures and stops associated MongoMemoryServer instances.
     * This method iterates through the specified fixture IDs, stopping their associated
     * MongoMemoryServer instances if they exist and removing the fixtures from memory.
     * 
     * @async
     * @param {string[]} ids - Array of fixture IDs to clean up.
     * @returns {Promise<void>} Resolves when cleanup is complete.
     */
    public async clean(ids: string[]): Promise<void> {
        await Promise.all(ids.map(async id => {
            for (const dbName in this.fixtures) {
                for (const collectionName in this.fixtures[dbName]) {
                    const fixture = this.fixtures[dbName][collectionName][id]

                    if (fixture) {
                        if ('mongoServer' in fixture) {
                            // ⏹️ Stop the specific memory server for this fixture
                            await fixture.mongoServer.stop()
                        }

                        delete this.fixtures[dbName][collectionName][id]
                    } 
                }
            }
        }))
    }

    /**
     * 🧹 Cleans up all fixtures and stops associated MongoMemoryServer instances.
     * This method iterates through all fixtures stored in memory, stopping their 
     * associated MongoMemoryServer instances and clearing the fixtures from memory.
     * 
     * @async
     * @returns {Promise<void>} Resolves when cleanup is complete.
     */
    public async cleanAll(): Promise<void> {
        const stops = []
    
        for (const db of Object.values(this.fixtures)) {
            for (const collection of Object.values(db)) {
                for (const fixture of Object.values(collection)) {
                    if ('mongoServer' in fixture) {
                        stops.push(fixture.mongoServer.stop())
                    }
                }
            }
        }

        await Promise.all(stops)
        this.fixtures = {}
    }
}

export default FixturesManager
