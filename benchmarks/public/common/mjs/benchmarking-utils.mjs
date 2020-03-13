import { getMeanDurationSeconds } from './maths.mjs'

// `performance` is not available in AudioWorklet, which makes
// benchmarking not accurate
let TIMING = globalThis.performance || globalThis.Date

class LoopRunner {

    constructor(config, loopBuilderBuilder) {
        this.timesInMs = []
        this.preview = null
        this.config = config
        this.loopBuilder = loopBuilderBuilder(config)
    }

    runLoop(context) {
        let startDate, endDate
        const loop = this.loopBuilder(context)
        startDate = TIMING.now()
        loop()
        endDate = TIMING.now()
        if (!this.preview) {
            this.preview = context.output.slice(0, this.config.previewSampleSize)
        }
        this.timesInMs.push(endDate - startDate)
    }

    compileResults() {
        let meanDuration = getMeanDurationSeconds(this.timesInMs)
        if (!meanDuration) {
            console.error('time to small to be measured')
            meanDuration = 0.000000001
        }
        return { 
            preview: this.preview, 
            meanDuration, 
            functionName: this.config.name 
        }
    }

    hasEnoughData() {
        return this.timesInMs.length >= this.config.functionIterations
    }

}

export const runFromWorker = (loopBuilderBuilder) => {

    onmessage = (message) => {
        const config = message.data
        const loopRunner = new LoopRunner(config, loopBuilderBuilder)
        console.log(`START FUNCTION ${config.name}`)
        while (!loopRunner.hasEnoughData()) {
            const context = { output: new Float32Array(config.blockSize) }
            loopRunner.runLoop(context)
        }
        const results = loopRunner.compileResults()
        console.log(`END FUNCTION ${config.name}, time : ${results.meanDuration}`)
        postMessage(results)
    }

}

export const runFromAudioWorklet = (loopBuilderBuilder) => {

    class BenchmarkProcessor extends AudioWorkletProcessor {
    
        constructor(options) {
            super(options)
            this.config = options.processorOptions
            this.loopRunner = new LoopRunner(this.config, loopBuilderBuilder)
            console.log(`START FUNCTION ${this.config.name}`)
        }
    
        process(inputs, outputs, parameters) {
            const context = { output: new Float32Array(this.config.blockSize) }
            this.loopRunner.runLoop(context)
            if (this.loopRunner.hasEnoughData()) {
                const results = this.loopRunner.compileResults()
                console.log(`END FUNCTION ${this.config.name}, time : ${results.meanDuration}`)
                this.port.postMessage(results)
                return false
            }
            return true
        }
    }
    
    registerProcessor("benchmark-processor", BenchmarkProcessor)
}