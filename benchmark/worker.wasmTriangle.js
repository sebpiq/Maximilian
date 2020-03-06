import { runFunction } from './common/benchmark.js'
import WasmAudioModule from  './wasm/simple/audio.mjs'

const FREQUENCY = 40

function wasmTriangle({ computeIterations }, { wasmAudioModule, output }) {
    let i = 0
    for (i; i < computeIterations; i++) {
        output[i] = wasmAudioModule._triangle(0, FREQUENCY)
    }
}

onmessage = (message) => {
    const config = message.data
    const wasmAudioModule = WasmAudioModule()
    wasmAudioModule.then(() => {
        postMessage(
            runFunction(wasmTriangle, config, { 
                wasmAudioModule, 
                output: new Array(config.computeIterations) 
            })
        )
    })
}