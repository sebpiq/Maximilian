import { getFloat32Array } from '/common/mjs/wasm-utils.mjs'
import { runFunction } from '/common/mjs/runner-worker.mjs'
import DspModule from  '/common/wasm/static-dsp/StaticDsp.mjs'

const FREQUENCY = 40

function wasmTriangleVector({ blockSize }, context) {
    context.dspModule._triangleVector(FREQUENCY)
}

onmessage = (message) => {
    const config = message.data
    const dspModule = DspModule()
    dspModule.then(() => {
        const output = getFloat32Array(dspModule, dspModule._allocate_block(config.blockSize), config.blockSize)
        const results = runFunction(wasmTriangleVector, config, { 
            dspModule, 
            output
        })
        postMessage(results)
    })
}