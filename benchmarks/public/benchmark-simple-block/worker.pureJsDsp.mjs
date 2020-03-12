import { runFunction } from '/common/mjs/benchmarking-utils.mjs'

const FREQUENCY = 40

function pureJsDsp({ blockSize }, { output, sampleRate }) {
    let i
    let phase = 0.0
    for (i = 0; i < blockSize; i++) {
        if ( phase >= 1.0 ) phase -= 1.0
        phase += 1 / (sampleRate/FREQUENCY)
        if (phase <= 0.5 ) {
            output[i] = (phase - 0.25) * 4
        } else {
            output[i] = ((1 - phase) - 0.25) * 4
        }
    }
}

onmessage = (message) => {
    const config = message.data
    const output = new Float32Array(config.blockSize)
    postMessage(
        runFunction(pureJsDsp, config, { 
            output, sampleRate: config.sampleRate
        })
    )
}