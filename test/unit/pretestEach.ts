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
import type { IModel, IModelCore } from '@/src/ModelManager'
import { default as ModelUtils, type IMemoryModel } from '@/src/ModelUtils'

declare global {
    // eslint-disable-next-line no-var
    var modelDetails: IModel<any>
    // eslint-disable-next-line no-var
    var mongooseSchema: mongoose.Schema
    // eslint-disable-next-line no-var
    var memoryModelDetails: IMemoryModel<any>
    // eslint-disable-next-line no-var
    var docData: Record<string, any>
}

/*
  Defining types below will not work because we can not assign them in runtime.
  However, for completion purposes, we will define them here.
*/
beforeAll(async() => {
    const {
        modelName, dbName, schema
    }: IModelCore = await import('@/test/models/Test.model.mjs')
  
    // Generate the Mongoose schema type
    type TMongooseSchema = mongoose.ObtainDocumentType<typeof schema>

    ;globalThis.mongooseSchema = new mongoose
        .Schema<TMongooseSchema>(schema, { collection: modelName })

    globalThis.memoryModelDetails = await ModelUtils.createMemoryModel<TMongooseSchema>({
        modelName,
        dbName,
        schema
    })

    globalThis.modelDetails = {
        modelName,
        Model: globalThis.memoryModelDetails.Model,
        dbName,
        schema
    }

    globalThis.docData = { name: 'test', decimals: 69n }
})

afterAll(async() => {
    // Calling stop() will only close the specifc connection and not all created memory-db connections
    await globalThis.memoryModelDetails.mongoServer.stop()
})

afterEach(() => {
    sinon.restore()
})