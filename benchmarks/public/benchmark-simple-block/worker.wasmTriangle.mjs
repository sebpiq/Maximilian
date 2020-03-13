import { runFunction } from '/common/mjs/runner-worker.mjs'
import DspModule from  '/common/wasm/static-dsp/StaticDsp.mjs'

const FREQUENCY = 40

function wasmTriangle({ blockSize }, { dspModule, output }) {
    let i = 0
    for (i; i < blockSize; i++) {
        output[i] = dspModule._triangle(0, FREQUENCY)
    }
}

onmessage = (message) => {
    const config = message.data
    const dspModule = DspModule()
    dspModule.then(() => {
        postMessage(
            runFunction(wasmTriangle, config, { 
                dspModule, 
                output: new Array(config.blockSize) 
            })
        )
    })
}