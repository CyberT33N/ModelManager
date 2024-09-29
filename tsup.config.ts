import { defineConfig } from 'tsup'
import * as glob from 'glob'

const entries = glob.sync('./src/*.ts')
console.log(entries)

export default defineConfig({
    entry: entries,
    format: ['cjs', 'esm'], // Build for commonJS and ESmodules
    dts: true, // Generate declaration file (.d.ts)
    splitting: false,
    sourcemap: true,
    clean: true
})