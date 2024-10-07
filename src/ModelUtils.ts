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
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { ResourceNotFoundError } from 'error-manager-helper';

// ==== INTERNAL ====
import MongooseUtils from './MongooseUtils';
import type { IModelCore } from './ModelManager';

/**
 * Interface representing a MongoDB memory model structure.
 */
interface MemoryModel {
    /** Mongoose model instance */
    Model: mongoose.Model<any>
    /** MongoMemoryServer instance for managing in-memory database */
    mongoServer: MongoMemoryServer
    /** Mongoose connection instance */
    conn: mongoose.Connection
}

/**
 * Utility class for handling Mongoose model-related operations.
 * Primarily used for creating and managing in-memory models using MongoMemoryServer.
 */
export default class ModelUtils {
    /**
     * Creates an in-memory Mongoose model using MongoMemoryServer.
     * This is useful for testing or scenarios where a transient, in-memory database is needed.
     *
     * @param {IModel<any>} modelDetail - The model object containing the schema and other details.
     * @returns {Promise<MemoryModel>} - An object containing the in-memory model, MongoMemoryServer instance, and connection.
     * @throws {ResourceNotFoundError} - Throws if the model is not found in ModelManager.
     */
    public static async createMemoryModel(
        modelDetail: IModelCore<any>
    ): Promise< MemoryModel > {
        // Destructure necessary properties from the model object
        const { dbName, schema, modelName } = modelDetail

        // Generate a TypeScript type for the Mongoose schema's document structure
        type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>

        // Create the Mongoose schema using a utility function
        const mongooseSchema = MongooseUtils.createSchema<TMongooseSchema>(schema, modelName)

        // Create a new instance of MongoMemoryServer for the in-memory database
        const mongoServer = await MongoMemoryServer.create({
            instance: { dbName }
        })

        // Establish a new Mongoose connection to the in-memory database
        const conn = await mongoose.createConnection(mongoServer.getUri(), { dbName }).asPromise()

        // Create a Mongoose model using the generated schema and the provided model name
        const Model = conn.model<TMongooseSchema>(modelName, mongooseSchema, modelName)

        // Return the created memory model, server, and connection
        return { Model, mongoServer, conn }
    }
}


