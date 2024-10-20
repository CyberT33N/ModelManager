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
import sinon from 'sinon'
import mongoose from 'mongoose'
import { beforeAll, afterAll, afterEach } from 'vitest'

// ==== INTERNAL ====
// 🗂️ Importing IModel and IModelCore types for model management.
import type { IModel, IModelCore } from '@/src/ModelManager'

// 🧪 Importing ModelUtils and IMemoryModel types for memory model management.
import { default as ModelUtils, type IMemoryModel } from '@/src/ModelUtils'

// 🏗️ Importing IMongooseSchema type for defining the mongoose schema.
import type { IMongooseSchema } from '@/test/models/Test.model.ts'

// 🌍 Declaring global variables for use across test files.
declare global {
    // 🚫 Exposing the global variable for model details.
    // eslint-disable-next-line no-var
    var modelDetails: IModel<any>
    
    // 🚫 Exposing the global variable for mongoose schema.
    // eslint-disable-next-line no-var
    var mongooseSchema: mongoose.Schema
    
    // 🚫 Exposing the global variable for memory model details.
    // eslint-disable-next-line no-var
    var memoryModelDetails: IMemoryModel<any>
    
    // 🚫 Exposing the global variable for document data.
    // eslint-disable-next-line no-var
    var docData: Record<string, any>
}

/**
 * @description Initializes global variables and prepares the database connection before tests run.
 */
beforeAll(async() => {
    // 🔄 Importing the model definition dynamically to avoid circular dependencies.
    const {
        modelName, dbName, schema
    }: IModelCore = await import('@/test/models/Test.model.mjs')

    // 🏗️ Creating a new mongoose schema using the imported schema.
    globalThis.mongooseSchema = new mongoose
        .Schema<IMongooseSchema>(schema, { collection: modelName })

    // 🏗️ Creating a memory model using ModelUtils with the provided schema.
    globalThis.memoryModelDetails = await ModelUtils.createMemoryModel<IMongooseSchema>({
        modelName,
        dbName,
        schema
    })

    // 🗄️ Setting the global model details for access in tests.
    globalThis.modelDetails = {
        modelName,
        Model: globalThis.memoryModelDetails.Model,
        dbName,
        schema
    }

    // 📋 Initializing document data for testing purposes.
    globalThis.docData = { name: 'test', decimals: 69n }
})

/**
 * @description Cleans up by stopping the memory database connection after tests complete.
 */
afterAll(async() => {
    // 🛑 Stopping the memory database server to clean up resources.
    await globalThis.memoryModelDetails.mongoServer.stop()
})

/**
 * @description Restores all sinon mocks and stubs after each test.
 */
afterEach(() => {
    // 🔄 Restoring the default behavior of all sinon mocks and stubs.
    sinon.restore()
})
