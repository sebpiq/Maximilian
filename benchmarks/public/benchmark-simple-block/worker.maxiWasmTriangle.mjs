import MaxiWasmModule from '/common/wasm/maximilian/maximilian.wasmmodule.js'
import { runFromWorker } from '/common/mjs/runner-worker.mjs'

const FREQUENCY = 40

runFromWorker((config) => {
    const osc = new MaxiWasmModule.maxiOsc()

    return Promise.resolve((context) => {
        const output = context.output
        const blockSize = config.blockSize
        return function maxiWasmTriangle() {
            let i = 0
            for (i; i < blockSize; i++) {
                output[i] = osc.triangle(FREQUENCY)
            }
        }
    })
})