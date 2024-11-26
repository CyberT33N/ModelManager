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
// 🍃 Simulates an in-memory MongoDB server for testing
import { MongoMemoryServer } from 'mongodb-memory-server'
export { MongoMemoryServer }

import mongoose from 'mongoose'

// ==== INTERNAL ====
import MongooseUtils from './MongooseUtils' // 🔧 Utility methods for Mongoose schemas
import type { IModelCore } from './ModelManager' // 📦 Interface for the core model data structure

/**
 * Interface representing a MongoDB memory model structure.
 * @template TSchema - The type of the document schema used by the model.
 * @property {mongoose.Model<TSchema>} Model - The mongoose model instance, used to interact with MongoDB documents.
 * @property {MongoMemoryServer} mongoServer - MongoMemoryServer instance for controlling the in-memory MongoDB server.
 * @property {mongoose.Connection} conn - Mongoose connection instance for the active MongoDB connection.
 * @property {string} mongoUri - The URI of the in-memory MongoDB instance, useful for debugging.
 */
export interface IMemoryModel<TSchema> {
    Model: mongoose.Model<TSchema>
    mongoServer: MongoMemoryServer
    conn: mongoose.Connection
    mongoUri: string
}

/**
 * Utility class responsible for operations on Mongoose models, such as creating 
 * and managing in-memory databases for testing purposes. Uses MongoMemoryServer to 
 * simulate MongoDB environments.
 * 
 * 🚀 **Usage**: 
 * This class is primarily used to test database interactions in isolation.
 * 
 * 🧩 **Related components**:
 * - Mongoose for creating and managing models
 * - MongoMemoryServer for simulating MongoDB instances
 */
export default class ModelUtils {
    /**
     * Creates an in-memory Mongoose model, connecting it to an in-memory MongoDB instance.
     * This is particularly useful for unit/integration testing without needing 
     * to spin up a real MongoDB server.
     *
     * @static
     * @template IMongooseSchema - The TypeScript type representing the Mongoose schema.
     * @param {IModelCore} modelCoreDetails - The core model details including schema and model name.
     * @returns {Promise<IMemoryModel<IMongooseSchema>>} - Promise resolving to an in-memory model with its connection.
     */
    public static async createMemoryModel<IMongooseSchema>(
        modelCoreDetails: IModelCore
    ): Promise<IMemoryModel<IMongooseSchema>> {
        // 🗂 Destructure necessary properties from the modelCoreDetails object
        const { dbName, schema, modelName } = modelCoreDetails

        // 🧱 Build the Mongoose schema using a utility method (MongooseUtils) and the provided schema definition
        const mongooseSchema = MongooseUtils.createSchema<IMongooseSchema>(schema, {
            collection: modelName
        })

        // 🧑‍💻 Spin up an in-memory MongoDB instance using MongoMemoryServer
        const mongoServer = await MongoMemoryServer.create({
            instance: { dbName }
        })

        // 🔌 Connect to the in-memory MongoDB server with the generated URI
        const conn = await mongoose
            .createConnection(mongoServer.getUri(), { dbName })
            .asPromise()

        // 🛠️ Create the Mongoose model, using the generated schema, model name, and connection
        const Model = conn.model<IMongooseSchema>(modelName, mongooseSchema, modelName)

        // 🔍 Extract the URI of the in-memory MongoDB for logging or debugging purposes
        const mongoUri = mongoServer.getUri()

        // 🏗️ Return a structured object containing all the necessary components of the in-memory model setup
        const memoryModel: IMemoryModel<IMongooseSchema> = {
            Model, mongoServer, conn, mongoUri
        }

        return memoryModel
    }
}

