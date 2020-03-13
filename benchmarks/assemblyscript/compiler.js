// Packs-in assemblyscript compiler so we can use it in the browser.
// REF : https://github.com/AssemblyScript/assemblyscript/tree/master/lib/sdk
importScripts('https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js')
let SDK_PROMISE 

const initializeAsc = self.initializeAsc = () => {
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

const compileAsc = self.compileAsc = async (ascString) => {
    const asc = await initializeAsc()
    const { binary, stderr } = asc.compileString(ascString, {
        optimizeLevel: 3,
        runtime: "none"
    })
    const errorMsg = stderr.toString()
    if (errorMsg) {
        throw new Error(`COMPILATION FAILED:\n${errorMsg}`)
    }
    return binary
}