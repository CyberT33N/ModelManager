# ModelManager

## Project Description

**ModelManager** is a powerful and flexible manager for Mongoose models in Node.js applications. This class simplifies the management of data models, allowing developers to dynamically load and manage Mongoose models.

## Key Features

- **Singleton Instance**: Ensures a single instance of the ModelManager class to avoid redundancy and conflicts.
- **Dynamic Model Loading**: Models are loaded based on a glob pattern definition, keeping the application scalable and modular.
- **Model Initialization**: Automatic initialization and index creation for all loaded models to optimize database query performance.
- **Model Access**: Methods to retrieve all models or a specific model, streamlining the development process.
- **Compatibility**: Built on Mongoose, one of the most popular libraries for MongoDB in Node.js.

## Usage

