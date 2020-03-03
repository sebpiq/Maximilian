import Module from './maximilian.wasmmodule.js'

const COMPUTE_ITERATIONS = 1000000
const FUNCTION_ITERATIONS = 10
const SAMPLE_RATE = 44100
const FREQUENCY = 40
const PREVIEW_SAMPLE_SIZE = 44100 / 40 * 3

function maximilianTriangle() {
    const osc = new Module.maxiOsc()
    let i = 0
    const output = new Array(COMPUTE_ITERATIONS)

    for (i; i < COMPUTE_ITERATIONS; i++) {
        output[i] = osc.triangle(FREQUENCY)
    }

    return output
}

function pureJsTriangle() {
    let i = 0
    let phase = 0
    const output = new Array(COMPUTE_ITERATIONS)

    for (i; i < COMPUTE_ITERATIONS; i++) {
        if ( phase >= 1.0 ) phase -= 1.0
        phase += 1 / (SAMPLE_RATE/FREQUENCY)
        if (phase <= 0.5 ) {
            output[i] = (phase - 0.25) * 4
        } else {
            output[i] = ((1 - phase) - 0.25) * 4
        }
    }

    return output
}

const getMeanDurationSeconds = (times) =>
    times.reduce((sum, val) => sum + val, 0) / times.length / 1000

const runBenchmark = (func) => {
    const benchmarkName = func.name
    console.log(`START RUNNING ${benchmarkName}`)
    
    let i = 0
    const times = []
    let preview = null
    for (i; i < FUNCTION_ITERATIONS; i++) {
        const startDate = Date.now()
        const output = func()
        const endDate = Date.now()
        if (i === 0) {
            preview = output.slice(0, PREVIEW_SAMPLE_SIZE)
        }
        times.push(endDate - startDate)
    }
    
    const meanDuration = getMeanDurationSeconds(times)
    console.log(`END RUNNING ${benchmarkName}, time : ${meanDuration}`)
    return {preview, meanDuration, benchmarkName}
}

postMessage({
    config: {
        sampleRate: SAMPLE_RATE, 
        computeIterations: COMPUTE_ITERATIONS
    },
    benchmarkResults: [
        runBenchmark(maximilianTriangle),
        runBenchmark(pureJsTriangle)
    ]
})