import { runFunction } from './common/benchmark.js'

const FREQUENCY = 40

function pureJsTriangle({ computeIterations, sampleRate }, { output }) {
    let i = 0
    let phase = 0

    for (i; i < computeIterations; i++) {
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
    postMessage(
        runFunction(pureJsTriangle, config, { 
            output: new Array(config.computeIterations) 
        })
    )
}