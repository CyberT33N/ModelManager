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
import { ValidationError, ResourceNotFoundError } from 'error-manager-helper'

import MongooseUtils from './MongooseUtils'

/**
 * Interface representing the details of a Mongoose model.
 * @template TSchema - The type of the document.
 */
export interface IModelCore {
    /** The name of the model. */
    modelName: string
    /** The name of the database where the model is stored. */
    dbName: string
    /** The schema used for the model. */
    schema: mongoose.SchemaDefinition
}

/**
 * Interface representing a Mongoose model along with additional metadata.
 * @template TSchema - The type of the document.
 */
export interface IModel<TSchema> extends IModelCore {
    /** The Mongoose Model instance. */
    Model: mongoose.Model<TSchema>
}

/**
 * A manager class for all Mongoose models in the application.
 * Manages the dynamic loading and initialization of Mongoose models.
 */
export default class ModelManager {
    // eslint-disable-next-line no-use-before-define
    private static instance: ModelManager | null = null

    /** A list of all loaded models. */
    public models: IModel<any>[] = []

    /**
     * Private constructor to prevent direct instantiation.
     * Access is provided via the `getInstance` method.
     */
    private constructor() {}

    /**
     * Returns the singleton instance of the ModelManager.
     * Initializes the instance upon the first call.
     * @static
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
     * @returns {Promise< IModel<any>[] >} - A promise that
     * resolves to an array of typed Mongoose models.
     */
    private async globModels(
        expression: string
    ): Promise< IModel<any>[] > {
        const modelPaths = await glob(expression)
        const modelDetails: IModel<any>[] = []

        for (const path of modelPaths) {
            // Ignore Webpack bundling during dynamic import
            const modelCoreDetail = await import(/* webpackIgnore: true */ path) as IModelCore
            const { modelName, dbName, schema } = modelCoreDetail

            // Generate the Mongoose schema type
            type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>

            const Model = await this.createModel<TMongooseSchema>({
                modelName,
                schema,
                dbName
            })
            
            console.log('[ModelManager] - Globbing Model:', modelName)

            const modelDetail: IModel<TMongooseSchema> = {
                modelName,
                Model,
                dbName,
                schema
            }

            modelDetails.push(modelDetail)
        }

        return modelDetails
    }

    /**
     * Adds a new Mongoose model to the instance model collection.
     * @private
     * @template TMongooseSchema - The schema type of the Mongoose model.
     * @param {IModel<TMongooseSchema>} modelDetails - The details of the model to add.
     * @throws {ValidationError} If a model with the same name already exists.
     * @returns {void} This method does not return a value.
     */
    private pushModel<TMongooseSchema>(
        modelDetails: IModel<TMongooseSchema>
    ): void {
        const existingModel = this.models.find(model => model.modelName === modelDetails.modelName)

        if (existingModel) {
            throw new ValidationError(
                `A model with the name '${modelDetails.modelName}' already exists.`,
                { modelDetails, existingModel }
            )
        }

        this.models.push(modelDetails)
    }

    /**
     * Returns all loaded Mongoose models.
     * @returns {IModel<any>[]} - A list of all loaded Mongoose models.
     */
    public getModels(): IModel<any>[] {
        return this.models
    }

    /**
     * Returns a specific Mongoose model based on its name.
     * @param {string} name - The name of the model.
     * @returns The Mongoose model or `undefined` if not found.
     */
    public getModel(name: string): IModel<any> | undefined {
        const modelDetails = this.models.find(model => model.modelName === name)

        if (!modelDetails) {
            throw new ResourceNotFoundError(
                `[Model Manager] - Model '${name}' not found.`,
                { name }
            )
        }

        return modelDetails
    }

    /**
     * Creates a Mongoose model based on the given name, schema, and database name.
     * @template TMongooseSchema - The type of the mongoose schema.
     * @param {IModelCore} modelDetails - An object containing the model's details.
     * @returns {Promise<mongoose.Model<TMongooseSchema>>} A promise that resolves
     * to the created Mongoose Model instance.
     */
    public async createModel<TMongooseSchema>({
        modelName,
        schema,
        dbName
    }: IModelCore ): Promise<mongoose.Model<TMongooseSchema>> {
        const mongooseUtils = MongooseUtils.getInstance(dbName)
        const Model = await mongooseUtils.createModel<TMongooseSchema>(schema, modelName)
        
        // Ensure indexes are created for the model
        await Model.createIndexes()

        const modelDetails: IModel<TMongooseSchema> = {
            modelName,
            Model,
            dbName,
            schema
        }

        this.models.push(modelDetails)
        return Model
    }
}