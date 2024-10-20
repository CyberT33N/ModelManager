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

// 🌐 Import the defineConfig function from the tsup package
import { defineConfig } from 'tsup'

// 📁 Import the glob module for file pattern matching
import { glob } from 'glob'

// 🔍 Get all TypeScript files in the src directory
const entries = glob.sync('./src/*.ts')

// 💬 Log the entries to the console
console.log(entries)

// 🚀 Export the configuration object for the build process
export default defineConfig({
    // 📥 Specify the entry files for the build
    entry: entries,

    // 🔄 Define the output formats: CommonJS and ES Modules
    format: ['cjs', 'esm'], // Build for commonJS and ESmodules

    // 📄 Enable the generation of a TypeScript declaration file
    dts: true, // Generate declaration file (.d.ts)

    // ⚙️ Disable code splitting
    splitting: false,

    // 🗺️ Enable source maps for easier debugging
    sourcemap: true,

    // 🧹 Clean the output directory before building
    clean: true
})
