import { runBenchmark } from './common/benchmark.js'
import WasmAudioModule from  './wasm/simple/audio.mjs'
import MaxiWasmModule from './wasm/maximilian/maximilian.wasmmodule.js'

const FREQUENCY = 40

function wasmTriangle({ computeIterations }, { wasmAudioModule, output }) {
    let i = 0
    for (i; i < computeIterations; i++) {
        output[i] = wasmAudioModule._triangle(0, FREQUENCY)
    }
}

function maxiWasmTriangle({ computeIterations }, { output }) {
    let i = 0
    const osc = new MaxiWasmModule.maxiOsc()

    for (i; i < computeIterations; i++) {
        output[i] = osc.triangle(FREQUENCY)
    }
}

function wasmTriangleVector({ computeIterations }, context) {
    context.wasmAudioModule._triangleVector(10000000, 0, computeIterations, FREQUENCY)
    context.output = context.wasmAudioModule.HEAPF32.subarray(0, computeIterations)
}

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
    switch(message.data.operation) {
        case 'run':
            const config = message.data.payload
            const wasmAudioModule = WasmAudioModule()
            wasmAudioModule.then(() => {
                const results = runBenchmark(
                    config, 
                    [wasmTriangle, { wasmAudioModule, output: new Array(config.computeIterations) }],
                    [wasmTriangleVector, { wasmAudioModule, output: null }],
                    [pureJsTriangle, { output: new Array(config.computeIterations) }],
                    [maxiWasmTriangle, { output: new Array(config.computeIterations) }],
                )
                postMessage({ config, results })
            })
            return 
    }
}