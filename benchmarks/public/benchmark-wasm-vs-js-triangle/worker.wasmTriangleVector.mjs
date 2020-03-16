import { getFloat32Array } from '/common/mjs/wasm-utils.mjs'
import { runFromWorker } from '/common/mjs/runner-worker.mjs'
import DspModule from  '/common/wasm/static-dsp/StaticDsp.mjs'

const FREQUENCY = 40

runFromWorker((config) => {
    const dspModule = DspModule()
    const dspOutput = getFloat32Array(dspModule, dspModule._allocate_block(config.blockSize), config.blockSize)
    return Promise.resolve((context) => {
        const blockOutput = context.output
        
        function wasmTriangleVector() {
            dspModule._triangleVector(FREQUENCY)
        }

        // We want set the output to the block we wrote in so we have the preview
        // of the signal, but we don't want this to be part of the timing.
        wasmTriangleVector.after = () => {
            blockOutput.set(dspOutput)
        }
        
        return wasmTriangleVector   
    })
})