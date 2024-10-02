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

import _ from 'lodash'
import { glob } from 'glob'

import mongoose, {
    type Model,
    type SchemaDefinition,
    type SchemaDefinitionType,
    type Document
} from 'mongoose'

import MongooseUtils from './MongooseUtils'

 /**
* Resolves the TypeScript type based on the Mongoose schema type definition.
* This utility helps map the correct TypeScript type from the provided Mongoose type.
*
* @template T The Mongoose schema type to resolve.
*
* Maps various Mongoose schema types to their respective TypeScript types:
* - String -> `string`
* - Number -> `number`
* - Boolean -> `boolean`
* - Date -> `Date`
* - Buffer -> `Buffer`
* - Mixed -> `mongoose.Schema.Types.Mixed`
* - ObjectId -> `mongoose.Types.ObjectId`
* - Decimal128 -> `mongoose.Schema.Types.Decimal128`
* - Map -> `Map<string, MongooseSchemaType<unknown>>`
* - UUID -> `mongoose.Schema.Types.UUID`
* - BigInt -> `mongoose.Schema.Types.BigInt`
* - Array -> Array of the resolved type.
*/
 type MongooseSchemaType<T> = 
 T extends typeof String ? string :
 T extends typeof Number ? number :
 T extends typeof Boolean ? boolean :
 T extends typeof Date ? Date :
 T extends typeof Buffer ? Buffer :
 T extends typeof mongoose.Schema.Types.Mixed ? mongoose.Schema.Types.Mixed :
 T extends typeof mongoose.Schema.Types.ObjectId ? mongoose.Types.ObjectId :
 T extends typeof mongoose.Schema.Types.Decimal128 ? mongoose.Schema.Types.Decimal128 : 
 T extends typeof mongoose.Schema.Types.Map ? Map<string, MongooseSchemaType<unknown>> :
 T extends typeof mongoose.Schema ? mongoose.Schema :
 T extends typeof mongoose.Types.UUID ? mongoose.Schema.Types.UUID : 
 T extends typeof BigInt ? mongoose.Schema.Types.BigInt :
 T extends Array<infer U> ? MongooseSchemaType<U>[] :
 never;

 /**
 * Infers the type for a schema field based on whether it's provided as an object with a `type` property
 * or as a direct type.
 *
 * @template T The schema type (can be an object or a direct type).
 *
 * @typedef {T extends { type: infer U } ? MongooseSchemaType<U> : MongooseSchemaType<T>} SchemaValue
 *
 * If the field is defined as an object with a `type` property, it extracts and resolves the type.
 * Otherwise, it directly resolves the schema type.
 */
 type SchemaValue<T> = T extends { type: infer U } ? MongooseSchemaType<U> : MongooseSchemaType<T>

 /**
 * Interface for the Mongoose schema definition.
 * This interface dynamically maps the schema definition
 * to the appropriate TypeScript types using `SchemaValue`.
 *
 * @typedef {Object.<string, SchemaValue<typeof schema[K]>>} GenerateMongooseSchemaType
 *
 * Maps the schema keys (fields) to their respective resolved TypeScript types.
 * 
 * Example usage:
 * 
 * ```ts
 * const schema = {
 *   name: { type: String },
 *   age: Number,
 *   isActive: Boolean,
 *   friends: [{ type: mongoose.Schema.Types.ObjectId }],
 * };
 *
 * type UserSchema = GenerateMongooseSchemaType<typeof schema>;
 * // UserSchema will be:
 * // {
 * //   name: string;
 * //   age: number;
 * //   isActive: boolean;
 * //   friends: mongoose.Types.ObjectId[];
 * // }
 * ```
 */
 type GenerateMongooseSchemaType<Schema extends mongoose.Schema> = {
     [K in keyof Schema]: SchemaValue<Schema[K]>
 }

/**
 * Interface representing the details of a Mongoose model.
 * @template T - The type of the document.
 */
interface ModelDetailsInterface<TSchema> {
    /** The name of the model. */
    modelName: string;
    /** The name of the database where the model is stored. */
    dbName: string;
    /** The schema used for the model. */
    schema: SchemaDefinition<SchemaDefinitionType<TSchema>>;
}

/**
 * Interface representing a Mongoose model along with additional metadata.
 * @template TSchema - The type of the document.
 */
interface ModelInterface<TSchema> extends ModelDetailsInterface<TSchema> {
    /** The Mongoose Model instance. */
    Model: Model<TSchema>;
}

/**
 * A manager class for all Mongoose models in the application.
 * Manages the dynamic loading and initialization of Mongoose models.
 */
class ModelManager {
    /** Singleton instance of the ModelManager. */
    // eslint-disable-next-line no-use-before-define
    private static instance: ModelManager

    /** A list of all loaded models. */
    public models: ModelInterface<GenerateMongooseSchemaType<mongoose.Schema>>[] = []

    /**
     * Private constructor to prevent direct instantiation.
     * Access is provided via the `getInstance` method.
     */
    private constructor() {}

    /**
     * Returns the singleton instance of the ModelManager.
     * Initializes the instance upon the first call.
     * @returns The singleton instance of the ModelManager.
     */
    public static async getInstance(): Promise<ModelManager> {
        if (this.instance) {
            return this.instance
        }

        this.instance = new ModelManager()
        await this.instance.init()

        return this.instance
    }

    /**
     * Initializes the ModelManager by loading all models.
     * @private
     */
    private async init(): Promise<void> {
        if (_.isEmpty(this.models)) {
            const expression = `${process.cwd()}/**/*.model.mjs`
            this.models = await this.globModels(expression)
        }
    }

    /**
     * Globs through files to dynamically import Mongoose models and creates typed models.
     * 
     * @private
     * @param {string} expression - The glob pattern used to find model files.
     * @returns {Promise<ModelInterface<GenerateMongooseSchemaType<mongoose.Schema>>[]>} 
     * - A promise that resolves to an array of typed Mongoose models.
     */
    private async globModels(
        expression: string
    ): Promise< ModelInterface<GenerateMongooseSchemaType<mongoose.Schema>>[] > {
        const modelPaths = await glob(expression)
        const models = []

        for (const path of modelPaths) {
            // Ignore Webpack bundling during dynamic import
            const modelDetails = await import(/* webpackIgnore: true */ path)
            const { modelName, dbName, schema } = modelDetails

            // Generate the Mongoose schema type
            type TMongooseSchema = GenerateMongooseSchemaType<typeof schema>

            const Model = await this.createModel<TMongooseSchema>({
                modelName, schema, dbName
            })
            
            console.log('[ModelManager] - Globbing Model:', modelName)

            const model: ModelInterface<TMongooseSchema> = {
                modelName,
                Model,
                dbName,
                schema
            }

            models.push(model)
        }

        return models
    }

    /**
     * Returns all loaded Mongoose models.
     * @returns A list of all loaded Mongoose models.
     */
    public getModels(): ModelInterface<Document>[] {
        const models = this.models
        return models
    }

    /**
     * Returns a specific Mongoose model based on its name.
     * @param name - The name of the model.
     * @returns The Mongoose model or `undefined` if not found.
     */
    public getModel(name: string): ModelInterface<Document> | undefined {
        const model = this.models.find(model => model.modelName === name)
        return model
    }

    /**
     * Creates a Mongoose model based on the given name, schema, and database name.
     * @template TMongooseSchema - The type of the mongoose schema.
     * @param name - The name of the model.
     * @param schema - The schema of the model.
     * @param dbName - The name of the database where the model is stored.
     * @returns A promise that resolves to the created Mongoose Model instance.
     */
    public async createModel<TMongooseSchema>({
        modelName,
        schema,
        dbName
    }: ModelDetailsInterface<TMongooseSchema>): Promise<Model<TMongooseSchema>> {
        const mongooseUtils = await MongooseUtils.getInstance(dbName)
        const Model = await mongooseUtils.createModel<TMongooseSchema>(schema, modelName)
        
        // Ensure indexes are created for the model
        await Model.createIndexes()
        return Model
    }
}

export default ModelManager
