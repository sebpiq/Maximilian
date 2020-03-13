import MaxiWasmModule from '/common/wasm/maximilian/maximilian.wasmmodule.js'
import { runFunction } from '/common/mjs/runner-worker.mjs'

const FREQUENCY = 40

function maxiWasmTriangle({ blockSize }, { output, osc }) {
    let i = 0
    for (i; i < blockSize; i++) {
        output[i] = osc.triangle(FREQUENCY)
    }
}

onmessage = (message) => {
    const config = message.data
    const osc = new MaxiWasmModule.maxiOsc()
    postMessage(
        runFunction(maxiWasmTriangle, config, { 
            output: new Array(config.blockSize),
            osc
        })
    )
}