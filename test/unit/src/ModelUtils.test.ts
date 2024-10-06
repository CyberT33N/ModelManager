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

// ==== VITEST ====
import { describe, it, expect, beforeEach, afterEach } from 'vitest'

// ==== DEPENDENCIES ====
import sinon from 'sinon'
import mongoose from 'mongoose'
import { MongoMemoryServer } from 'mongodb-memory-server'

// ==== CODE ====
import ModelUtils from '@/src/ModelUtils'

// ==== CLASSES ====
import MongooseUtils from '@/src/MongooseUtils'
import ModelManager from '@/src/ModelManager'

// describe('[TEST] - ModelUtils', () => {
//      interface IUser {
//           name: string;
//           email: string;
//           avatar?: string;
//         }
        
//      const userSchema = new mongoose.Schema<IUser>({
//          name: { type: String, required: true },
//          email: { type: String, required: true },
//          avatar: String
//      })
    
//      const UserModel = mongoose.model<IUser>('User', userSchema)

        
//      describe('[METHODS]', () => {
//          describe('[STATIC]', () => {
//              describe('createMemoryModel()', () => {
//                  let modelManager: ModelManager

//                  beforeEach(async() => {
//                      modelManager = await ModelManager.getInstance()
//                  })
       
//                  describe('[ERROR]', () => {
//                      let getModelStub: sinon.SinonStub

//                      beforeEach(() => {
//                          getModelStub = sinon.stub(modelManager, 'getModel').returns(undefined as any)
//                      })

//                      afterEach(() => {
//                          getModelStub.restore()
//                      })

//                      it('should throw an error if the model with the specified name does not exist', async() => {
//                          const modelName = 'ModelNotFound'

//                          await expect(
//                              () => ModelUtils.createMemoryModel(modelName)
//                          ).rejects.toThrowError(`createMemoryModel() - Model '${modelName}' not found.`)

//                          expect(getModelStub.calledOnce).toBe(true)
//                          expect(getModelStub.calledWith(modelName)).toBe(true)
//                      })
//                  })

//                  describe('[SUCCESS]', () => {
//                      let getModelStub: sinon.SinonStub
//                      let mongooseUtilsCreateSchemaStub: sinon.SinonStub
//                      let mongoMemoryServerSpy: sinon.SinonSpy
//                      let mongooseConnectSpy: sinon.SinonSpy

//                      const modelName = 'Model1'

//                      beforeEach(() => {
//                          getModelStub = sinon.stub(modelManager, 'getModel').returns({
//                              modelName,
//                              Model: UserModel,
//                              dbName: 'test',
//                              schema: userSchema
//                          })

//                          mongooseUtilsCreateSchemaStub = sinon.stub(MongooseUtils, 'createSchema')
//                              .returns(userSchema)

//                          mongoMemoryServerSpy = sinon.spy(MongoMemoryServer, 'create')
//                          mongooseConnectSpy = sinon.spy(mongoose, 'createConnection')
//                      })

//                      afterEach(() => {
//                          getModelStub.restore()
//                      })

//                      it('should return the model with the specified name', async() => {
//                          const result = await ModelUtils.createMemoryModel(modelName)
//                          expect(result.Model.modelName).toEqual(modelName)
//                          expect(result.mongoServer).toBeTruthy()
//                          expect(result.conn).toBeTruthy()
                   
//                          expect(getModelStub.calledOnce).toBe(true)
//                          expect(getModelStub.calledWith(modelName)).toBe(true)

//                          expect(mongooseUtilsCreateSchemaStub.calledOnce).toBe(true)
//                          expect(mongooseUtilsCreateSchemaStub.calledWith(userSchema, modelName)).toBe(true)

//                          expect(mongoMemoryServerSpy.calledOnce).toBe(true)
//                          expect(mongoMemoryServerSpy.calledWith({ instance: { dbName: 'test' } })).toBe(true)

//                          expect(mongooseConnectSpy.calledOnce).toBe(true)                 
//                      })
//                  })
//              })
//          })
//      })
// })
