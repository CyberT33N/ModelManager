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
*/

import _ from 'lodash'
import { glob } from 'glob'
import mongoose from 'mongoose'

import MongooseUtils from './MongooseUtils'
import Modelutils from './ModelUtils'

/**
 * Interface representing the details of a Mongoose model.
 * @template TSchema - The type of the document.
 */
export interface IModelCore<TSchema> {
    /** The name of the model. */
    modelName: string;
    /** The name of the database where the model is stored. */
    dbName: string;
    /** The schema used for the model. */
    schema: mongoose.SchemaDefinition<TSchema>;
}

/**
 * Interface representing a Mongoose model along with additional metadata.
 * @template TSchema - The type of the document.
 */
export interface IModel<TSchema> extends IModelCore<TSchema> {
    /** The Mongoose Model instance. */
    Model: mongoose.Model<any>;
}

/**
 * @extends Modelutils
 * A manager class for all Mongoose models in the application.
 * Manages the dynamic loading and initialization of Mongoose models.
 */
export default class ModelManager extends Modelutils {
    /** Singleton instance of the ModelMaSchemanager. */
    // eslint-disable-next-line no-use-before-define
    private static instance: ModelManager | null = null

    /** A list of all loaded models. */
    public models: IModel<any>[] = []

    /**
     * Private constructor to prevent direct instantiation.
     * Access is provided via the `getInstance` method.
     */
    private constructor() {
        super()
    }

    /**
     * Returns the singleton instance of the ModelManager.
     * Initializes the instance upon the first call.
     * @returns {Promise<ModelManager>} - The singleton instance of the ModelManager.
     */
    public static async getInstance(): Promise<ModelManager> {
        if (!this.instance) {
            this.instance = new ModelManager()
            await this.instance.init()
        }
        
        return this.instance
    }

    /**
     * Initializes the ModelManager by loading all models.
     * @private
     * @returns {Promise<void>} - A promise that resolves when the initialization is complete.
     */
    private async init(): Promise<void> {
        if (_.isEmpty(this.models)) {
            const expression = `${process.cwd()}/**/*.model.mjs`
            this.models = await this. globModels(expression)
        }
    }

    /**
     * Globs through files to dynamically import Mongoose models and creates typed models.
     * @private
     * @param {string} expression - The glob pattern used to find model files.
     * @returns {Promise< IModel<mongoose.SchemaDefinition<{}>>[] >} 
     * - A promise that resolves to an array of typed Mongoose models.
     */
    private async globModels(
        expression: string
    ): Promise< IModel<mongoose.SchemaDefinition<{}>>[] > {
        const modelPaths = await glob(expression)
        const models: IModel<mongoose.SchemaDefinition<{}>>[] = []

        for (const path of modelPaths) {
            // Ignore Webpack bundling during dynamic import
            const modelDetails = await import(/* webpackIgnore: true */ path)
            const { modelName, dbName, schema } = modelDetails

            // Generate the Mongoose schema type
            type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>

            const Model = await this.createModel<TMongooseSchema>({
                modelName,
                schema,
                dbName
            })
            
            console.log('[ModelManager] - Globbing Model:', modelName)

            const model: IModel<TMongooseSchema> = {
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
    public getModels(): IModel<mongoose.SchemaDefinition<{}>>[] {
        return this.models
    }

    /**
     * Returns a specific Mongoose model based on its name.
     * @param {string} name - The name of the model.
     * @returns The Mongoose model or `undefined` if not found.
     */
    public getModel(name: string): IModel<mongoose.SchemaDefinition<{}>> | undefined {
        return this.models.find(model => model.modelName === name)
    }

    /**
     * Creates a Mongoose model based on the given name, schema, and database name.
     * @template TMongooseSchema - The type of the mongoose schema.
     * @param modelDetails - An object containing the model's details.
     * @returns A promise that resolves to the created Mongoose Model instance.
     */
    public async createModel<TMongooseSchema>({
        modelName,
        schema,
        dbName
    }: IModelCore<TMongooseSchema>): Promise< mongoose.Model<TMongooseSchema> > {
        const mongooseUtils = await MongooseUtils.getInstance(dbName)
        const Model = await mongooseUtils.createModel<TMongooseSchema>(schema, modelName)
        
        // Ensure indexes are created for the model
        await Model.createIndexes()
        return Model
    }
}