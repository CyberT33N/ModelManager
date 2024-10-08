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
import { BaseError } from 'error-manager-helper'

/**
 * A utility class for managing MongoDB connections and schemas.
 */
class MongooseUtils {
    // A map to hold instances of MongooseUtils for different databases
    // eslint-disable-next-line no-use-before-define
    private static instances: Map<string, MongooseUtils> = new Map()

    // MongoDB connection object
    private conn: mongoose.Connection | null = null

    // Connection string for MongoDB
    private connectionString: string

    /**
     * Private constructor to prevent direct instantiation.
     * @param {string} dbName - The name of the database to connect to.
     */
    private constructor(readonly dbName: string) {
        this.connectionString = process.env.MONGODB_CONNECTION_STRING!
    }

    /**
     * Gets an instance of MongooseUtils for a specified database.
     * If an instance does not exist, a new one will be created.
     * @param {string} dbName - The name of the database.
     * @returns An instance of MongooseUtils.
     */
    public static getInstance(dbName: string): MongooseUtils {
        if (!MongooseUtils.instances.has(dbName)) {
            MongooseUtils.instances.set(dbName, new MongooseUtils(dbName))
        }
        
        return MongooseUtils.instances.get(dbName)!
    }

    /**
     * Creates a Mongoose schema for a given model.
     * https://mongoosejs.com/docs/guide.html#options
     * @template TMongooseSchema - The type of the Mongoose schema.
     * @param {mongoose.SchemaDefinition<TMongooseSchema>} schema - The schema definition for the model.
     * @param {string} collectionName - The name of the collection in MongoDB.
     * @returns {mongoose.Schema<TMongooseSchema>} A Mongoose Schema object.
     */
    public static createSchema<TMongooseSchema>(
        schema: mongoose.SchemaDefinition<TMongooseSchema>,
        collectionName: string
    ): mongoose.Schema<TMongooseSchema> {
        const mongooseSchema = new mongoose.Schema<TMongooseSchema>(schema, { collection: collectionName })
        return mongooseSchema
    }

    /**
     * Initializes the MongoDB connection.
     * @throws BaseError if the connection fails.
     * @returns {void} A Promise that resolves when the connection is established.
     */
    private async init(): Promise<void> {
        console.log('[ModelManager] - Attempting to connect to MongoDB...')

        this.updateConnectionString()

        try {
            this.conn = await mongoose.createConnection(this.connectionString).asPromise()
        } catch (e) {
            throw new BaseError(
                '[ModelManager] - Error while initializing connection with MongoDB',
                e as Error
            )
        }
    }

    /**
     * Updates the connection string to include the database name.
     * @returns {void} A void that esolves when the connection string is updated.
     */
    private updateConnectionString(): void {
        const urlObj = new URL(this.connectionString)
        urlObj.pathname = `/${this.dbName}`
        this.connectionString = urlObj.toString()
    }

    /**
     * Retrieves the current MongoDB connection.
     * If the connection is not established, it will initialize it first.
     * @returns {Promise<mongoose.Connection>} A Promise that resolves to the MongoDB connection.
     */
    public async getConnection(): Promise<mongoose.Connection> {
        if (!this.conn) {
            await this.init()
        }

        return this.conn!
    }

    /**
     * Creates a model for a specified schema and collection name.
     * @template TMongooseSchema - The type of the Mongoose schema.
     * @param {mongoose.SchemaDefinition<TMongooseSchema>} schema - The schema definition for the model.
     * @param {string} modelName - The name of the model and collection.
     * @returns {Promise<mongoose.Model<TMongooseSchema>>} A Promise that resolves to the Mongoose Model.
     */
    public async createModel<TMongooseSchema>(
        schema: mongoose.SchemaDefinition<TMongooseSchema>,
        modelName: string
    ): Promise<mongoose.Model<TMongooseSchema>> {
        const mongooseSchema = MongooseUtils.createSchema<TMongooseSchema>(schema, modelName)
        const conn = await this.getConnection()

        const model = conn.model<TMongooseSchema>(modelName, mongooseSchema, modelName)
        return model
    }
}

export default MongooseUtils
