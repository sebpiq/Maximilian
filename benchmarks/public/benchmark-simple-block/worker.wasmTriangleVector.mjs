import { getFloat32Array } from '/common/mjs/wasm-utils.mjs'
import { runFromWorker } from '/common/mjs/runner-worker.mjs'
import DspModule from  '/common/wasm/static-dsp/StaticDsp.mjs'

const FREQUENCY = 40

runFromWorker((config) => {
    const dspModule = DspModule()
    const dspOutput = getFloat32Array(dspModule, dspModule._allocate_block(config.blockSize), config.blockSize)
    return Promise.resolve((context) => {
        const blockOutput = context.output
        return function wasmTriangleVector() {
            dspModule._triangleVector(FREQUENCY)
            blockOutput.set(dspOutput)
        }        
    })
})