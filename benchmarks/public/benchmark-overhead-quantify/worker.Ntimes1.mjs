import { getFloat32Array } from '/common/mjs/wasm-utils.mjs'
import { runFromWorker } from '/common/mjs/runner-worker.mjs'
import DspModule from  '/common/wasm/static-dsp/StaticDsp.mjs'

const FREQUENCY = 40

runFromWorker((config) => {
    const dspModule = DspModule()
    const dspOutput = getFloat32Array(dspModule, dspModule._allocate_block(1), 1)
    return Promise.resolve((context) => {
        return function wasmTriangleVector() {
            for (let i=0; i < config.blockSize; i++) {
                dspModule._triangleVector(FREQUENCY)
                // context.output[i] = dspOutput[0]
            }
        }        
    })
})