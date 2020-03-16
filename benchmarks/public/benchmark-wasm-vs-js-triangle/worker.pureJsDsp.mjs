import { runFromWorker } from '/common/mjs/runner-worker.mjs'

const FREQUENCY = 40

runFromWorker((config) => {
    return Promise.resolve((context) => {
        const output = context.output
        const blockSize = config.blockSize
        const sampleRate = config.sampleRate
        return function pureJsDsp() {
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
    })
})