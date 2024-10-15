# 📋 Overview
This module consists of three essential components: **Model Manager**, **Model Utils**, and **Mongoose Utils**. Together, they streamline the management and creation of Mongoose models and MongoDB connections in Node.js, providing a framework for dynamic model creation, in-memory testing, and multi-tenant database management. This enables developers to achieve high performance, scalability, and modularity, enhancing development workflows and application reliability.









<br><br>
<br><br>

# Model Manager 📦
The **Model Manager** is the core class of this package and facilitates dynamic management of Mongoose models in a Node.js application. It simplifies loading models from specified directories, making it ideal for multi-tenant configurations. The class enhances interactions with Mongoose, allowing for efficient model management and ensuring consistent schema definitions, promoting scalability and maintainability.

<br>

## 📄 Usage

### 1. Define MongoDB Connection String

Make sure to load environment variable `MONGODB_CONNECTION_STRING`:

```shell
MONGODB_CONNECTION_STRING=mongodb://root:test@192.168.49.2.nip.io:30644/?authSource=admin
```
- You can use dependencies like: [dotenv](https://www.npmjs.com/package/dotenv)

<br>

### 2. Initializing the Model Manager

The `ModelManager` is a singleton class. To get the instance and initialize it, use the following code:

```typescript
import { ModelManager } from 'mongoose-model-manager'
const modelManager = await ModelManager.getInstance()
```

<br>

The `ModelManager` automatically globs for all `*.model.mjs` files in your project. Ensure your model files are named correctly for them to be recognized and follow this exported format:
```javascript
const modelName = 'testModelName'
const dbName = 'testDbName'

const schema = {
    name: { 
        type: String,
        required: true,
        unique: true,
        index: true
    },
    decimals: { type: BigInt, required: true }
}

export { dbName, modelName, schema }
```
- **The model name will be used aswell for the collection name**

<br><br>

## Methods 📜

<br>

### .getModel()
- Get specific mongoose model

#### Arguments:
- **`modelName`**: `{string}` - The name of the Mongoose model. This name will also be used for the corresponding collection in the database.
```typescript
const model = modelManager.getModel(modelName)
```

<br>

### .getModels()
- Get all mongoose models
```typescript
const models = modelManager.getModels()
```

<br>

### .createModel()
- Create a new mongoose model and push it to the instance

#### Arguments:
- **`modelDetails`**: `{Object}` - An object containing the following properties:
  - **`modelName`**: `{string}` - The name of the Mongoose model. This name will also be used for the corresponding collection in the database.
  - **`dbName`**: `{string}` - The name of the database where the model will be created.
  - **`schema`**: `{Object}` - The schema definition for the model, mapping field names to their types.

```typescript
interface IUser {
    name: string
    email: string
}

const schema = {
    name: String,
    email: String
}

const newModel = await modelManager.createModel<IUser>({
    modelName: 'NewModel',
    dbName: 'YourDatabaseName',
    schema
})
```






















<br><br>
<br><br>

# 🔗 Model Utils
The **Model Utils** class specializes at the moment in creating in-memory models using [MongoDB Memory Server](https://www.npmjs.com/package/mongodb-memory-server) but it will be maybe extended in the future. This utility is crucial for parallel testing scenarios that require transient databases, allowing developers to create isolated environments that mimic real MongoDB behavior without persistent storage overhead.

<details><summary>Click to expand..</summary>

<br>

## .createMemoryModel() [STATIC]


```typescript
import { ModelUtils } from 'mongoose-model-manager'

interface IUser {
    name: string
    email: string
}

const schema = {
    name: String,
    email: String
}

const modelDetails = {
    dbName: 'YourDatabaseName',
    modelName: 'YourModelName',
    schema
}

const memoryModel = await ModelUtils.createMemoryModel<IUser>(modelDetails)

const UserModel = memoryModel.Model

// Creating a new user
const newUser = await UserModel.create({
    name: 'John Doe', email: 'john@example.com'
});

// Fetching all users
const users = await UserModel.find({});
```

<br>

### Response

The created in-memory model will return an object containing the following:

- **Model:** The Mongoose model instance.
- **mongoServer:** The `MongoMemoryServer` instance that manages the in-memory database. Please check the docs of [MongoDB Memory Server](https://www.npmjs.com/package/mongodb-memory-server) for all options.
- **conn:** The Mongoose connection instance to the in-memory database.
- **mongoUri:** - The MongoDB Connection String



</details>


















<br><br>
<br><br>

# 🔗 Mongoose Utils
The **Mongoose Utils** class offers tools for managing and creating Mongoose connections and schemas, optimized for multi-tenant databases. Employing the Singleton design pattern, it ensures a single instance per database for efficient resource management.

**However, this serves more as a utility class, and everything you require will be encompassed and managed by `ModelManager`.**

<details><summary>Click to expand..</summary>


<br>

## Getting an Instance

To `get or create` instance of `MongooseUtils` for a specific database:
```typescript
import { MongooseUtils } from 'mongoose-model-manager'
const mongooseUtils = MongooseUtils.getInstance('YourDatabaseName')
```

<br>

## .getConnection()
You can recieve a mongoose connection the specific instance database as follows:

```typescript
const conn = await mongooseUtils.getConnection()
```
- If the connection does not exists it will be created



<br>

## .createSchema() [STATIC]
- Will create the mongoose schema

### Arguments:
- **1**: `{string}` - Schema
- **2**: `{object}` - Mongoose Schema Options (https://mongoosejs.com/docs/guide.html#options)

```typescript
interface IUser {
    name: string
    email: string
}

const schema = {
    name: String,
    email: String
}

const model = await MongooseUtils.createSchema<IUser>(
    schema,
    { collection: 'test' }
)
```


<br>

## .createModel()

You can create a mongoose connection model based on the specified instance database as follows:

### Arguments:
- **1**: `{object}` - Schema Definiton
- **2**: `{string}` - The name of the Mongoose model. This name will also be used for the corresponding collection in the database.

```typescript
interface IUser {
    name: string
    email: string
}

const schema = {
    name: String,
    email: String
}

const model = await mongooseUtils.createModel<IUser>(
    schema,
    modelName
)
```

</details>




























<br><br>
<br><br>
<br><br>
<br><br>

## FixturesManager
- This class will help you manage your fixtures for your tests

<br><br>
<br><br>

### Pre insert before all tests
- By using `fixturesManager.getFixture(ID)` you can directly get the imported fixture document. Notice that this document will include the mongoose object ID, timestamps or big int.

```typescript
// ==== TYPES ====
import { Interface as NewPairsInterface } from '@/models/crypto/eth/NewPairs.model.interface'

let FIXT_NewPairs: NewPairsInterface

const modelName = 'ETH.NewPairs'

const ID_NewPairs = '000000000000000000000001'

beforeAll(async() => {
     FIXT_NewPairs = fixturesManager.getFixture(ID_NewPairs)
})

afterEach(async() => {
     await fixturesManager.cleanAll()
})

describe('[DOCS FOUND]', () => {
     beforeEach(async() => {
          const fixtures = await fixturesManager.insert([ID_NewPairs])
          const { Model } = fixtures[ID_NewPairs]

          getModelStub = sinon.stub(modelManager, 'getModel').returns({
          Model
         })
     })

     it('should return columns, coins, statusOptions because coins are found', async() => {
          const result = await fetchNewPairs()

          expect(getModelStub.calledOnce).toBe(true)

          expect(result.columns).toEqual(expectedColumns)
          expect(result.coins[0].toObject()).toEqual(FIXT_NewPairs.doc)
          expect(result.statusOptions).toEqual(expectedStatusOptions)
     })
})
```

<br><br>
<br><br>

### Stringified documents
- By using `fixturesManager.insert([ID])` you wil have access to different proprties. E.g. the model ot the stringified DOC. This is usefully for integrations tests where your mongoose documents will be returned as JSON and not as javascript object

```typescript
// ==== TYPES ====
import { Interface as NewPairsInterface } from '@/models/crypto/eth/NewPairs.model.interface'

describe('[DOCS FOUND]', () => {
     let FIXT_NewPairs: NewPairsInterface

     beforeEach(async() => {
          const fixtures = await fixturesManager.insert([ID_NewPairs])
          const { Model } = fixtures[ID_NewPairs]
          ;({ docToObject: FIXT_NewPairs } = fixtures[ID_NewPairs])

          getModelStub = sinon.stub(modelManager, 'getModel').returns({
               Model
          })
     })

     it('should return columns, coins, statusOptions because coins are found', async() => {
          const response = await GET()
          const responseData = await response.json()

          expect(response.status).toBe(200)

          expect(getModelStub.calledOnce).toBe(true)

          expect(responseData.columns).toEqual(expectedColumns)
          expect(responseData.coins[0]).toEqual(FIXT_NewPairs.doc)
          expect(responseData.statusOptions).toEqual(expectedStatusOptions)
     })
})
```

<br><br>
<br><br>

### Lean documents
- https://mongoosejs.com/docs/tutorials/lean.html
- Will return the leaned mongoose document
```typescript
beforeEach(async() => {
     const fixtures = await fixturesManager.insert([ID_NewPairs])
     const { Model } = fixtures[ID_NewPairs]
     ;({ docLean: FIXT_NewPairs } = fixtures[ID_NewPairs])
})
```
