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
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

// ==== INTERNAL ====
import MongooseUtils from './MongooseUtils'
import type { IModelCore } from './ModelManager'

/**
 * Interface representing a MongoDB memory model structure.
 * @template TSchema - The type of the document.
 */
export interface IMemoryModel<TSchema> {
    /** Mongoose model instance */
    Model: mongoose.Model<TSchema>
    /** MongoMemoryServer instance for managing in-memory database */
    mongoServer: MongoMemoryServer
    /** Mongoose connection instance */
    conn: mongoose.Connection
    /** The URI of the in-memory database */
    mongoUri: string
}

/**
 * Utility class for handling Mongoose model-related operations.
 * At the moment primarily used for creating and managing in-memory models using MongoMemoryServer.
 */
export default class ModelUtils {
    /**
     * Creates an in-memory Mongoose model using MongoMemoryServer.
     * This is useful for testing or scenarios where a transient, in-memory database is needed.
     * @static
     * @template TMongooseSchema - The type of the Mongoose schema.
     * @param {IModelCore} modelCoreDetails - The model 
     * object containing the schema and other details.
     * @returns {Promise<IMemoryModel<TMongooseSchema>>} - An object containing
     * the in-memory model, MongoMemoryServer instance, and connection.
     */
    public static async createMemoryModel<TMongooseSchema>(
        modelCoreDetails: IModelCore
    ): Promise<IMemoryModel<TMongooseSchema>> {
        // Destructure necessary properties from the model object
        const { dbName, schema, modelName } = modelCoreDetails

        // Create the Mongoose schema using a utility function
        const mongooseSchema = MongooseUtils.createSchema<TMongooseSchema>(schema, {
            collection: modelName
        })
        
        // Create a new instance of MongoMemoryServer for the in-memory database
        const mongoServer = await MongoMemoryServer.create({
            instance: { dbName }
        })

        // Establish a new Mongoose connection to the in-memory database
        const conn = await mongoose
            .createConnection(mongoServer.getUri(), { dbName })
            .asPromise()

        // Create a Mongoose model using the generated schema and the provided model name
        const Model = conn.model<TMongooseSchema>(modelName, mongooseSchema, modelName)

        // Get the URI of the in-memory database
        const mongoUri = mongoServer.getUri()

        // Return the created memory model, server, and connection
        const memoryModel: IMemoryModel<TMongooseSchema> = {
            Model, mongoServer, conn, mongoUri
        }

        return memoryModel
    }
}


