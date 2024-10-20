# 📋 Overview
This module consists of four essential components:
- **Model Manager**
- **Fixture Manager**
- **Model Utils**
- **Mongoose Utils**

<br>

Together, they streamline the management and creation of Mongoose models and MongoDB connections in Node.js, providing a comprehensive framework for:

- **Dynamic Model Creation**: Seamlessly generate Mongoose models on the fly, making it easier to scale and adapt to changing data structures.
  
- **In-Memory Testing**: If needed utilize Models with the [mongodb-memory-server](https://www.npmjs.com/package/mongodb-memory-server) for running tests with isolated in-memory databases. This approach ensures fast, reliable, parallel and deterministic tests.

- **Multi-Tenant Database Management**: Manage multiple databases dynamically, enabling multi-tenancy support by handling distinct connections for different client environments effortlessly.

<br>

By combining `FixturesManager` and `ModelManager`, this framework empowers developers to achieve **high performance**, **scalability**, and **modularity**. It optimizes development workflows by automating model creation and fixture handling, which enhances both testing efficiency and overall application reliability.







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

### `.getInstance()`
- Retrieves the singleton instance of the ModelManager. Initializes the instance on the first call.
```typescript
/**
 * @returns {Promise<ModelManager>} The singleton instance.
 */
public static async getInstance(): Promise<ModelManager>
```

```typescript
import { ModelManager } from 'mongoose-model-manager'
const modelManager = await ModelManager.getInstance()
```

<br><br>

### `.getModel()`
- Retrieves a Mongoose model by its name. Throws an error if the model is not found.

```typescript
/**
 * @param {string} name - The model name.
 * @returns {IModel<any>} The Mongoose model or throws an error.
 * @throws {ResourceNotFoundError} If the model is not found.
 */
public getModel(name: string): IModel<any>
```
```typescript
import { ModelManager } from 'mongoose-model-manager'
const modelManager = await ModelManager.getInstance()

const model = modelManager.getModel(modelName)
```

<br><br>

### `.getModels()`
- Returns all loaded Mongoose models.

```typescript
/**
 * @returns {IModel<any>[]} Array of loaded models.
 */
public getModels(): IModel<any>[]
```
```typescript
import { ModelManager } from 'mongoose-model-manager'
const modelManager = await ModelManager.getInstance()

const models = modelManager.getModels()
```




<br><br>

### `.createModel()`
- Create a new mongoose model and push it to the instance
```typescript
/**
 * @template IMongooseSchema - The schema type.
 * @param {IModelCore} modelDetails - Object containing details for creating the model.
 * @param {string} modelDetails.modelName - The name of the model being created. 
 *    This will be used as the identifier within the application and MongoDB collection.
 * @param {mongoose.Schema<IMongooseSchema>} modelDetails.schema - The Mongoose schema defining the structure
 *    and validation rules for the model. It dictates how documents in the collection will be structured.
 * @param {string} modelDetails.dbName - The name of the database where the model will be stored.
 *    This is essential for multi-tenant applications or cases where multiple databases are managed.
 * 
 * @returns {Promise<mongoose.Model<IMongooseSchema>>} The created Mongoose model.
 * 
 */
public async createModel<IMongooseSchema>({
    modelName,
    schema,
    dbName
}: IModelCore): Promise<mongoose.Model<IMongooseSchema>>

```
```typescript
import { ModelManager } from 'mongoose-model-manager'
const modelManager = await ModelManager.getInstance()

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

## Methods 📜

<br>

## `.createMemoryModel()`
- Creates an in-memory Mongoose model, connecting it to an in-memory MongoDB instance. This is particularly useful for unit/integration testing without needing to spin up a real MongoDB server
```typescript
/**
 * @template IMongooseSchema - The TypeScript type representing the Mongoose schema.
 * @param {IModelCore} modelCoreDetails - The core model details including schema and model name.
 * @returns {Promise<IMemoryModel<IMongooseSchema>>} - Promise resolving to an in-memory model with its connection.
 */
public static async createMemoryModel<IMongooseSchema>(
    modelCoreDetails: IModelCore
): Promise<IMemoryModel<IMongooseSchema>>
```

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

### `.getInstance()`
- Retrieves the singleton instance of `MongooseUtils` for a specific database. Initializes the instance on the first call.
```typescript
/**
 * @param {string} dbName - Name of the database to connect.
 * @returns {MongooseUtils} The instance managing the connection to the database.
 */
public static getInstance(dbName: string): MongooseUtils
```

```typescript
import { MongooseUtils } from 'mongoose-model-manager'
const mongooseUtils = MongooseUtils.getInstance('YourDatabaseName')
```



<br><br>

## `.getConnection()`
- Retrieves the MongoDB connection, initializing it if not already connected.

```typescript
/**
 * @returns {Promise<mongoose.Connection>} The established MongoDB connection.
 */
public async getConnection(): Promise<mongoose.Connection>
```

```typescript
import { MongooseUtils } from 'mongoose-model-manager'
const mongooseUtils = MongooseUtils.getInstance('YourDatabaseName')
const conn = await mongooseUtils.getConnection()
```





<br><br>

## `.createSchema()`
- Creates a new Mongoose schema for a model.
```typescript
**
* @template IMongooseSchema - Interface representing the Mongoose schema.
* @param {mongoose.SchemaDefinition} schema - The schema definition for the model.
* @param {mongoose.SchemaOptions<any>} options - Schema options such as timestamps or collection name.
* @returns {mongoose.Schema<IMongooseSchema>} The constructed Mongoose schema.
* 
* @see https://mongoosejs.com/docs/guide.html#options for options.
*/
public static createSchema<IMongooseSchema>(
    schema: mongoose.SchemaDefinition,
    options: mongoose.SchemaOptions<any>
): mongoose.Schema<IMongooseSchema>
```

```typescript
import { MongooseUtils } from 'mongoose-model-manager'

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






<br><br>

## `.createModel()`
- Creates a Mongoose model for a specific schema and collection. This method connects to the database, defines a schema, and initializes a model.

```typescript
/**
 * @template IMongooseSchema - Interface representing the schema definition.
 * @param {mongoose.SchemaDefinition} schema - The schema to define the model.
 * @param {string} modelName - The name of the model and corresponding MongoDB collection.
 * @returns {Promise<mongoose.Model<IMongooseSchema>>} The initialized Mongoose model.
 */
public async createModel<IMongooseSchema>(
    schema: mongoose.SchemaDefinition,
    modelName: string
): Promise<mongoose.Model<IMongooseSchema>>
```
```typescript
import { MongooseUtils } from 'mongoose-model-manager'
const mongooseUtils = MongooseUtils.getInstance('YourDatabaseName')

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



























<br><br><br><br>



# 🛠️ FixturesManager
- This project provides a Singleton pattern-based `FixturesManager` to handle fixtures for MongoDB in-memory database testing, specifically for Mongoose models. It's designed to load, insert, and clean up test data efficiently, supporting integration with [mongodb-memory-server](https://www.npmjs.com/package/mongodb-memory-server) and automated fixture loading from file system patterns.


<details><summary>Click to expand..</summary>

<br>

# ✨ Features
- **Singleton Pattern**: Ensures only one instance of the manager exists.
- **MongoDB Memory Server**: Utilizes `MongoMemoryServer` to create an isolated in-memory database for testing.
- **Mongoose Model Integration**: Automatically loads Mongoose models and fixtures.
- **Glob Support**: Loads fixture files using glob patterns.
- **Automatic Cleanup**: Cleans up databases and stops memory servers after tests.
- **Error Handling**: Built-in error validation for duplicate fixture IDs and missing data.

<br><br>

# Initializing the Model Manager

The `FixturesManager` is a singleton class. To get the instance and initialize it, use the following code:

```typescript
import { FixturesManager } from 'mongoose-model-manager'
const modelManager = await ModelManager.getInstance()
```

<br>

The `FixturesManager` automatically globs for all `*.ts` files at the path `test/fixtures` inside of your project root. Ensure your fixtures are following this exported format:
```javascript
import mongoose from 'mongoose'

const name = 'Example test fixture only for unit tests'

const docContents = {
    _id: new mongoose.Types.ObjectId('000000000000000000000001'),
    name: 'Unit Test fixture',
    decimals: 18n,
    __v: 0
}

export { docContents, name }
```



<br><br>

# Example inserting and cleaning fixtures

```typescript
import { FixturesManager } from 'mongoose-model-manager'
import {
    beforeAll,
    beforeEach, afterEach,
    describe, it
} from 'vitest'

let FIXT_NewPairs

const modelName = 'ETH.NewPairs'
const ID_NewPairs = '000000000000000000000001'

beforeAll(async () => {
    const fixturesManager = await FixturesManager.getInstance()
    FIXT_NewPairs = fixturesManager.getFixture(ID_NewPairs)
})

afterEach(async() => {
    await fixturesManager.clean([ID_NewPairs])
})

describe('[EXAMPLE TEST CASE]', () => {
    beforeEach(async() => {
        const fixtures = await fixturesManager.insert([ID_NewPairs])
        const { Model } = fixtures[ID_NewPairs]

        getModelStub = sinon.stub(ModelManager.prototype, 'getModel').resolves({
            Model
        })
    })

    it('should return columns, coins, statusOptions because coins are found', async() => {
        const result = await fetchNewPairs()
        expect(getModelStub.calledOnce).toBe(true)
        expect(result.coins[0].value).toEqual(FIXT_NewPairs.doc.value)
    })
})
```




<br><br>

# 🧰 Methods

<br>

## `getInstance()`
- Retrieves the singleton instance of the manager. Initializes it on the first call.
```typescript
public static async getInstance(): Promise<FixturesManager>
```
```typescript
import { FixturesManager } from 'mongoose-model-manager'
const fixturesManager = await FixturesManager.getInstance()
```

<br>

## `insert()`
- Inserts specified fixtures into the in-memory MongoDB instance and returns their inserted state.

```typescript
/**
 * @param {string[]} ids - Array of fixture IDs to insert.
 * @returns {Promise<Record<string, IFixture>>} The inserted fixture data.
 * @throws {ValidationError} If the fixture has already been inserted.
 * @throws {ResourceNotFoundError} If the fixture ID is not found.
 */
public async insert(
    ids: string[]
): Promise<{ [id: string]: IFixture }>
```
```typescript
import { FixturesManager } from 'mongoose-model-manager'
const fixturesManager = await FixturesManager.getInstance()

const result = await fixturesManager.insert([fixtureId])
```

<br>

### Response
The inserted fixture will return object(`{ [id: string]: IFixture }`) containing the following properties:
- **`name`**: Identifier for the fixture.
- **`docContents`**: The actual data which is stored in your fixture file
- **`doc`**: The inserted Mongoose document.
- **`docLean`**: The lean (plain object) version of the document.
- **`docToObject`**: The document as a plain JavaScript object.
- **`Model`**: The Mongoose memory model used for insertion.
- **`mongoServer`**: The in-memory MongoDB instance.



<br><br>

## `getFixture(id: string)`
- Fetches a fixture by its ID. Throws a `ResourceNotFoundError` if not found.
```typescript
/**
 * @param {string} id - The ID of the fixture to retrieve.
 * @returns {IFixtureDoc | IFixtureInserted} The fixture object.
 * @throws {ResourceNotFoundError} If the fixture ID is not found.
 */
public getFixture(id: string): IFixtureDoc | IFixtureInserted 
```
```typescript
import { FixturesManager } from 'mongoose-model-manager'
const fixturesManager = await FixturesManager.getInstance()

await fixturesManager.insert(fixtureId)
const fixture = await fixturesManager.getFixture(fixtureId)
```

<br>

## `clean()`
- Cleans up specific fixtures and stops associated MongoMemoryServer instances. This method iterates through the specified fixture IDs, stopping their associated MongoMemoryServer instances if they exist and removing the fixtures from memory.
```typescript
/**
* @param {string[]} ids - Array of fixture IDs to clean up.
* @returns {Promise<void>} Resolves when cleanup is complete.
*/
public async clean(ids: string[]): Promise<void>
```
```typescript
import { FixturesManager } from 'mongoose-model-manager'
const fixturesManager = await FixturesManager.getInstance()

const fixture = await fixturesManager.insert(fixtureId)
await fixturesManager.clean([fixtureId])
```


<br><br>

## `cleanAll()`
- Cleans up all fixtures and stops associated MongoMemoryServer instances. This method iterates through all fixtures stored in memory, stopping their associated MongoMemoryServer instances and clearing the fixtures from memory.
```typescript
/**
 * @returns {Promise<void>} Resolves when cleanup is complete.
 */
public async cleanAll(): Promise<void>
```
```typescript
import { FixturesManager } from 'mongoose-model-manager'
const fixturesManager = await FixturesManager.getInstance()

const fixture = await fixturesManager.insert(fixtureId)
const fixture2 = await fixturesManager.insert(fixtureId2)
await fixturesManager.cleanAll()
```




</details>



























