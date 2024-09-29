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

import {
    type Model,
    type SchemaDefinition, type SchemaDefinitionType,
    type Document 
} from 'mongoose'

import MongooseUtils from './MongooseUtils'

interface ModelInterface<T> {
    modelName: string
    Model: Model<T>
    dbName: string
    schema: SchemaDefinition<SchemaDefinitionType<T>>
}

// Manager for all mongoose models
class ModelManager {
    // eslint-disable-next-line no-use-before-define
    private static instance: ModelManager
    public models: Array<ModelInterface<Document>> = []

    private constructor() {}

    public static async getInstance(): Promise<ModelManager> {
        if (this.instance) {
            return this.instance
        }

        this.instance = new ModelManager()
        await this.instance.init()

        return this.instance
    }

    private async init() {
        if (_.isEmpty(this.models)) {
            const expression = `${process.cwd()}/**/*.model.mjs`
            this.models = await this.globModels(expression)
        }
    }

    private async globModels<T>(expression: string): Promise<Array<ModelInterface<T>>> {
        const modelPaths = await glob(expression)
    
        const models = []
    
        for (const path of modelPaths) {
            // Do not remove the webpackIgnore comment
            const modelDetails = await import(/* webpackIgnore: true */ path)
            const { modelName, dbName, schema }: ModelInterface<T> = modelDetails
    
            const Model = await this.createModel(modelName, schema, dbName)
            console.log('[ModelManager] - Globbing Model:', modelName)

            const model: ModelInterface<T> = {
                modelName, Model, dbName, schema
            }

            models.push(model)
        }
    
        return models
    }

    public getModels(): Array<ModelInterface<Document>> {
        const models = this.models
        return models
    }

    public getModel(name: string): ModelInterface<Document> | undefined {
        const model = this.models.find(model => model.modelName === name)
        return model
    }

    // Create a model by given name, schema and dbName
    public async createModel<T>(
        name: string, 
        schema: SchemaDefinition<SchemaDefinitionType<T>>,
        dbName: string
    ): Promise<Model<T>> {
        const mongooseUtils = await MongooseUtils.getInstance(dbName)

        const Model = await mongooseUtils.createModel(schema, name)
        await Model.createIndexes()

        return Model
    }
}

export default ModelManager


