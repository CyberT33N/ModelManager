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

// 🔗 ==== DEPENDENCIES ====
import _ from 'lodash'
import { glob } from 'glob'
import mongoose from 'mongoose'
import { ValidationError, ResourceNotFoundError } from 'error-manager-helper'

// 🔗 ==== INTERNAL DEPENDENCIES ====
import MongooseUtils from './MongooseUtils'

/**
 * 💻 Interface representing the core details of a Mongoose model.
 */
export interface IModelCore {
    /** 📛 The name of the model. */
    modelName: string
    /** 🏢 The name of the database where the model resides. */
    dbName: string
    /** 📜 The schema used for the model. */
    schema: mongoose.SchemaDefinition
}

/**
 * 💻 Interface representing a Mongoose model along with additional metadata.
 * @template TSchema - The type of the document (schema definition).
 */
export interface IModel<TSchema> extends IModelCore {
    /** 💾 The Mongoose Model instance. */
    Model: mongoose.Model<TSchema>
}

/**
 * 🛠️ Singleton class for managing all Mongoose models in the application.
 * Handles the dynamic loading and initialization of models.
 */
export default class ModelManager {
    // 🔒 Static instance for Singleton pattern
    // eslint-disable-next-line no-use-before-define
    private static instance: ModelManager

    /** 📋 Array storing all loaded Mongoose models. */
    public models: IModel<any>[] = []

    /**
     * 🔒 Private constructor to enforce singleton pattern.
     * Use `getInstance` to access the ModelManager.
     */
    private constructor() {}

    /**
     * 🚀 Retrieves the singleton instance of the ModelManager.
     * Initializes the instance on the first call.
     * @static
     * @returns {Promise<ModelManager>} The singleton instance.
     */
    public static async getInstance(): Promise<ModelManager> {
        if (!this.instance) {
            this.instance = new ModelManager()
            await this.instance.init()
        }

        return this.instance
    }

    /**
     * ⚙️ Initializes the ModelManager by loading all models dynamically.
     * @private
     * @returns {Promise<void>} Resolves when all models are loaded.
     */
    private async init(): Promise<void> {
        // 🛑 Check if models are already loaded
        if (_.isEmpty(this.models)) {
            const expression = `${process.cwd()}/**/*.model.mjs`
            this.models = await this.globModels(expression)
        }
    }

    /**
     * 🔍 Finds model files using a glob pattern and dynamically imports them.
     * @private
     * @param {string} expression - Glob pattern to find model files.
     * @returns {Promise<IModel<any>[]>} Resolves to an array of loaded models.
     */
    private async globModels(expression: string): Promise<IModel<any>[]> {
        const modelPaths = await glob(expression)
        const modelDetails: IModel<any>[] = []

        for (const path of modelPaths) {
            console.log('[ModelManager] - Importing Model:', path)

            // 🛑 webpackIgnore prevents bundling issues during dynamic import
            const modelCoreDetail = await import(/* webpackIgnore: true */ path) as IModelCore
            const { modelName, dbName, schema } = modelCoreDetail

            // 🏗️ Generate Mongoose schema type
            type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>

            const Model = await this.createModel<TMongooseSchema>({ modelName, schema, dbName })
            console.log('[ModelManager] - Loaded Model:', modelName)

            modelDetails.push({
                modelName,
                Model,
                dbName,
                schema
            })
        }

        return modelDetails
    }

    /**
     * ➕ Adds a new Mongoose model to the collection.
     * Throws an error if the model name already exists.
     * @private
     * @template TMongooseSchema - The schema type.
     * @param {IModel<TMongooseSchema>} modelDetails - Details of the model.
     * @throws {ValidationError} If the model already exists.
     */
    private pushModel<TMongooseSchema>(modelDetails: IModel<TMongooseSchema>): void {
        // 🛑 Check for existing model
        const existingModel = this.models.find(model => model.modelName === modelDetails.modelName)

        if (existingModel) {
            throw new ValidationError(
                `Model '${modelDetails.modelName}' already exists.`,
                { modelDetails, existingModel }
            )
        }

        this.models.push(modelDetails)
    }

    /**
     * 🧾 Returns all loaded Mongoose models.
     * @public
     * @returns {IModel<any>[]} Array of loaded models.
     */
    public getModels(): IModel<any>[] {
        return this.models
    }

    /**
     * 🔍 Retrieves a Mongoose model by its name.
     * Throws an error if the model is not found.
     * @public
     * @param {string} name - The model name.
     * @returns {IModel<any>} The Mongoose model or throws an error.
     * @throws {ResourceNotFoundError} If the model is not found.
     */
    public getModel(name: string): IModel<any> {
        // 🛑 Search for model by name
        const modelDetails = this.models.find(model => model.modelName === name)

        if (!modelDetails) {
            throw new ResourceNotFoundError(`[Model Manager] - Model '${name}' not found.`, { name })
        }

        return modelDetails
    }

    /**
     * 🏗️ Creates a new Mongoose model.
     * @public
     * @template TMongooseSchema - The schema type.
     * @param {IModelCore} modelDetails - Object containing model details.
     * @returns {Promise<mongoose.Model<TMongooseSchema>>} The created Mongoose model.
     */
    public async createModel<TMongooseSchema>({
        modelName,
        schema,
        dbName
    }: IModelCore): Promise<mongoose.Model<TMongooseSchema>> {
        const mongooseUtils = MongooseUtils.getInstance(dbName)
        const Model = await mongooseUtils.createModel<TMongooseSchema>(schema, modelName)

        // 🧩 Ensure indexes are created for the model
        await Model.createIndexes()

        this.models.push({
            modelName,
            Model,
            dbName,
            schema
        })
        return Model
    }
}
