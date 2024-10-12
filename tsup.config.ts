import { defineConfig } from 'tsup'
import * as glob from 'glob'

const entries = glob.sync('./src/*.ts')
console.log(entries)

export default defineConfig({
    entry: entries,
    format: ['cjs', 'esm'], // Build for commonJS and ESmodules
    dts: true, // Generate declaration file (.d.ts)
    splitting: false,
    // outExtension: ({ format }) => {
    //     if (format === 'esm') return { js: '.mjs' }  // Setze die Dateiendung auf .mjs für ESM
    //     return { js: '.js' }     // Fallback auf .js für andere Formate
    // },
    sourcemap: true,
    clean: true
})