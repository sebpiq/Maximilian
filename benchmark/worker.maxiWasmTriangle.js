import MaxiWasmModule from './wasm/maximilian/maximilian.wasmmodule.js'
import { runFunction } from './common/benchmark.js'

const FREQUENCY = 40

function maxiWasmTriangle({ computeIterations }, { output, osc }) {
    let i = 0
    for (i; i < computeIterations; i++) {
        output[i] = osc.triangle(FREQUENCY)
    }
}

onmessage = (message) => {
    const config = message.data
    const osc = new MaxiWasmModule.maxiOsc()
    postMessage(
        runFunction(maxiWasmTriangle, config, { 
            output: new Array(config.computeIterations),
            osc
        })
    )
}