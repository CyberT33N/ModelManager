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
import { ModelManager } from 'model-manager'
const modelManager = await ModelManager.getInstance()
```

<br>

### 3. Globbing Model Files

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


<br>

### 4. Accessing Models

Once initialized, you can access your loaded models as follows:

```typescript
// Get all models
const models = modelManager.getModels()

// Get specific model
const model = modelManager.getModel(modelName)
```

<br>

### 5. Creating a New Model

If you need to create a new model dynamically, you can use the `.createModel()` method:

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
- **The model name will be used aswell for the collection name**























<br><br>
<br><br>

# 🔗 Model Utils
The **Model Utils** class specializes in creating in-memory models using [MongoDB Memory Server](https://www.npmjs.com/package/mongodb-memory-server)
. This utility is crucial for parallel testing scenarios that require transient databases, allowing developers to create isolated environments that mimic real MongoDB behavior without persistent storage overhead.

<details><summary>Click to expand..</summary>

<br>

## Creating an In-Memory Model

To create an in-memory Mongoose model, utilize the `.createMemoryModel()` method as follows:

```typescript
import { ModelUtils } from 'model-manager'

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

// .createMemoryModel() is static method
const memoryModel = await ModelUtils.createMemoryModel<IUser>(modelDetails)

const UserModel = memoryModel.Model

// Creating a new user
const newUser = await UserModel.create({ name: 'John Doe', email: 'john@example.com' });

// Fetching all users
const users = await UserModel.find({});
```


<br>

## Structure of the In-Memory Model

The created in-memory model will return an object containing the following:

- **Model:** The Mongoose model instance.
- **mongoServer:** The `MongoMemoryServer` instance that manages the in-memory database. Please check the docs of [MongoDB Memory Server](https://www.npmjs.com/package/mongodb-memory-server) for all options.
- **conn:** The Mongoose connection instance to the in-memory database.



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
import { MongooseUtils } from 'model-manager'
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

## .createSchema()
You can create a mongoose schema as follows:

```typescript
interface IUser {
    name: string
    email: string
}

const schema = {
    name: String,
    email: String
}

// .createSchema() is static method
const model = await MongooseUtils.createSchema<IUser>(
    schema,
    collectionName
)
```


<br>

## .createModel()

You can create a mongoose connection model based on the specified instance database as follows:

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
- **The model name will be used for the collection name**


</details>