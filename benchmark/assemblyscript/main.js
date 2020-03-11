// We can't import ES6 modules directly in our worker, since we need to support `importScripts`. 
// So we let webpack deal with this :
import { runFunction } from '../common/benchmark'
import { NodeTemplate } from '../common/dsp-templates.mjs'
self.runFunction = runFunction
self.NodeTemplate = NodeTemplate

// REF : https://docs.assemblyscript.org/basics/loader
const loader = require("@assemblyscript/loader")

let SDK_PROMISE 

const initializeAsc = self.initializeAsc = () => {
    importScripts('https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js')
    if (SDK_PROMISE) {
        return SDK_PROMISE
    }
    
    SDK_PROMISE = new Promise((resolve) => {
        requirejs([ "https://cdn.jsdelivr.net/npm/assemblyscript@latest/dist/sdk.js" ], function(sdk) {
            sdk.asc.ready.then(() => resolve(sdk.asc))
        })
    })
    
    return SDK_PROMISE
}

const loadAsc = self.loadAsc = async (ascString) => {
    const asc = await initializeAsc()
    const { binary, stderr } = asc.compileString(ascString, {
        optimizeLevel: 3,
        runtime: "none"
    })
    const errorMsg = stderr.toString()
    if (errorMsg) {
        throw new Error(`COMPILATION FAILED:\n${errorMsg}`)
    }
    return loader.instantiateSync(binary)
}