import { runFromWorker } from '/common/mjs/runner-worker.mjs'
import DspModule from  '/common/wasm/static-dsp/StaticDsp.mjs'

const FREQUENCY = 40

runFromWorker((config) => {
    const dspModule = DspModule()
    return Promise.resolve((context) => {
        const output = context.output
        const blockSize = config.blockSize
        return function wasmTriangle() {
            let i = 0
            for (i; i < blockSize; i++) {
                output[i] = dspModule._triangle(0, FREQUENCY)
            }
        }
    })
})