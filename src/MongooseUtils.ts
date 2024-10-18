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
 * ⚙️ Utility class to manage MongoDB connections and schema creation.
 * 
 * Handles initialization, connection, and model creation for multiple MongoDB databases.
 */
class MongooseUtils {
    // 🗂️ Map to store instances of MongooseUtils for different databases
    private static instances = new Map<string, MongooseUtils>()

    // ⚡ MongoDB connection object, initialized as null
    private conn: mongoose.Connection | null = null

    // 🔗 Connection string for MongoDB
    private connectionString: string

    /**
     * 🚫 Private constructor to ensure singleton pattern for each database instance.
     * 
     * @private
     * @param {string} dbName - Name of the MongoDB database.
     */
    private constructor(readonly dbName: string) {
        this.connectionString = process.env.MONGODB_CONNECTION_STRING!
    }

    /**
     * 🔑 Retrieves the singleton instance of `MongooseUtils` for a specific database.
     * 
     * @static
     * @param {string} dbName - Name of the database to connect.
     * @returns {MongooseUtils} The instance managing the connection to the database.
     */
    public static getInstance(dbName: string): MongooseUtils {
        if (!MongooseUtils.instances.has(dbName)) {
            MongooseUtils.instances.set(dbName, new MongooseUtils(dbName))
        }

        return MongooseUtils.instances.get(dbName)!
    }

    /**
     * 🛠️ Creates a new Mongoose schema for a model.
     * 
     * @static
     * @template TMongooseSchema - Interface representing the Mongoose schema.
     * @param {mongoose.SchemaDefinition} schema - The schema definition for the model.
     * @param {mongoose.SchemaOptions<any>} options - Schema options such as timestamps or collection name.
     * @returns {mongoose.Schema<TMongooseSchema>} The constructed Mongoose schema.
     * 
     * @see https://mongoosejs.com/docs/guide.html#options for options.
     */
    public static createSchema<TMongooseSchema>(
        schema: mongoose.SchemaDefinition,
        options: mongoose.SchemaOptions<any>
    ): mongoose.Schema<TMongooseSchema> {
        // 📜 Creating new Mongoose schema with provided schema and options
        const mongooseSchema = new mongoose.Schema<TMongooseSchema>(schema, options)
        return mongooseSchema
    }

    /**
     * 🚀 Initializes a connection to MongoDB for the current database.
     * 
     * If the connection fails, it throws an error wrapped in `BaseError`.
     * 
     * @private
     * @throws {BaseError} If the MongoDB connection fails.
     * @returns {Promise<void>} Resolves when connection is successfully established.
     */
    private async init(): Promise<void> {
        console.log('[ModelManager] - Attempting to connect to MongoDB...')

        // 🔄 Updating connection string with the current database name
        this.updateConnectionString()

        try {
            // 🔌 Creating a connection to MongoDB and storing the result in `this.conn`
            this.conn = await mongoose.createConnection(this.connectionString).asPromise()
        } catch (e) {
            // 💥 Throwing error if MongoDB connection initialization fails
            throw new BaseError(
                '[ModelManager] - Error while initializing connection with MongoDB',
                e as Error
            )
        }
    }

    /**
     * 🔄 Updates the connection string with the current database name.
     * 
     * Modifies the `pathname` of the connection URL to ensure the correct database is targeted.
     * 
     * @private
     * @returns {void} The connection string is updated in place.
     */
    private updateConnectionString(): void {
        const urlObj = new URL(this.connectionString)
        // 🏷️ Setting the database name in the connection string
        urlObj.pathname = `/${this.dbName}`
        this.connectionString = urlObj.toString()
    }

    /**
     * 🛡️ Retrieves the MongoDB connection, initializing it if not already connected.
     * 
     * Ensures that the database connection is established and returns it.
     * 
     * @returns {Promise<mongoose.Connection>} The established MongoDB connection.
     */
    public async getConnection(): Promise<mongoose.Connection> {
        // 🔄 If no connection exists, initialize it
        if (!this.conn) {
            await this.init()
        }

        // ⚡ Return the existing or newly created connection
        return this.conn!
    }

    /**
     * 📊 Creates a Mongoose model for a specific schema and collection.
     * 
     * This method connects to the database, defines a schema, and initializes a model.
     * 
     * @template TMongooseSchema - Interface representing the schema definition.
     * @param {mongoose.SchemaDefinition} schema - The schema to define the model.
     * @param {string} modelName - The name of the model and corresponding MongoDB collection.
     * @returns {Promise<mongoose.Model<TMongooseSchema>>} The initialized Mongoose model.
     */
    public async createModel<TMongooseSchema>(
        schema: mongoose.SchemaDefinition,
        modelName: string
    ): Promise<mongoose.Model<TMongooseSchema>> {
        // 🏗️ Creating a schema with the provided definition and setting collection name
        const mongooseSchema = MongooseUtils.createSchema<TMongooseSchema>(schema, {
            collection: modelName
        })
        
        // 🔄 Retrieving the MongoDB connection
        const conn = await this.getConnection()

        // 🔨 Defining the Mongoose model and linking it to the collection
        const model = conn.model<TMongooseSchema>(modelName, mongooseSchema, modelName)
        return model
    }
}

export default MongooseUtils