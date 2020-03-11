import { runFunction } from './common/benchmark.mjs'
import WasmAudioModule from  './wasm/simple/audio.mjs'

const FREQUENCY = 40

function wasmTriangleVector({ computeIterations }, context) {
    context.wasmAudioModule._triangleVector(10000000, 0, computeIterations, FREQUENCY)
    context.output = context.wasmAudioModule.HEAPF32.subarray(0, computeIterations)
}

onmessage = (message) => {
    const config = message.data
    const wasmAudioModule = WasmAudioModule()
    wasmAudioModule.then(() => {
        const results = runFunction(wasmTriangleVector, config, { 
            wasmAudioModule, 
            output: null
        })
        postMessage(results)
    })
}