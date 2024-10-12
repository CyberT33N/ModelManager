import { ModelManager } from './dist/index.js'
const modelManager = await ModelManager.getInstance()

const model = modelManager.getModel('testModelName')
console.log(model.modelName)